"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wtfnode = require("wtfnode"); // Debugging the event loop
var express = require("express");
var req_logging_1 = require("./middleware/req-logging");
// Middleware
var route_ratelimit_1 = require("./middleware/route-ratelimit");
var path = require("path");
var logger = require("morgan");
var wlogger = require("./util/winston-logging");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var basicAuth = require("express-basic-auth");
var helmet = require("helmet");
var debug = require("debug")("rest-cloud:server");
var http = require("http");
var cors = require("cors");
var AuthMW = require("./middleware/auth");
var BitcoinCashZMQDecoder = require("bitcoincash-zmq-decoder");
var zmq = require("zeromq");
var sock = zmq.socket("sub");
var swStats = require("swagger-stats");
var apiSpec;
if (process.env.NETWORK === "mainnet") {
    apiSpec = require("./public/bitcoin-com-mainnet-rest-v2.json");
}
else {
    apiSpec = require("./public/bitcoin-com-testnet-rest-v2.json");
}
require("dotenv").config();
var app = express();
app.locals.env = process.env;
app.use(swStats.getMiddleware({ swaggerSpec: apiSpec }));
app.use(helmet());
app.use(cors());
app.enable("trust proxy");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use("/public", express.static(__dirname + "/public"));
// Log each request to the console with IP addresses.
app.use(logger(":remote-addr :remote-user :method :url :status :response-time ms - :res[content-length] :user-agent"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Local logging middleware for tracking incoming connection information.
app.use("/", req_logging_1.logReqInfo);
// Make io accessible to our router
app.use(function (req, res, next) {
    req.io = io;
    next();
});
var v2prefix = "v2";
// Instantiate the authorization middleware, used to implement pro-tier rate limiting.
var auth = new AuthMW();
app.use("/" + v2prefix + "/", auth.mw());
// Rate limit on all v2 routes
app.use("/" + v2prefix + "/", route_ratelimit_1.routeRateLimit);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = {
        message: "Not Found",
        status: 404
    };
    next(err);
});
// error handler
app.use(function (err, req, res, next) {
    var status = err.status || 500;
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(status);
    res.json({
        status: status,
        message: err.message
    });
});
/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
console.log("rest.bitcoin.com started on port " + port);
/**
 * Create HTTP server.
 */
var server = http.createServer(app);
var io = require("socket.io").listen(server);
// io.on("connection", (socket: Socket) => {
//   // console.log("Socket Connected")
//   socket.on("disconnect", () => {
//     // console.log("Socket Disconnected")
//   })
// })
/**
 * Setup ZMQ connections if ZMQ URL and port provided
 */
if (process.env.ZEROMQ_URL && process.env.ZEROMQ_PORT) {
    console.log("Connecting to BCH ZMQ at " + process.env.ZEROMQ_URL + ":" + process.env.ZEROMQ_PORT);
    var bitcoincashZmqDecoder_1 = new BitcoinCashZMQDecoder(process.env.NETWORK);
    sock.connect("tcp://" + process.env.ZEROMQ_URL + ":" + process.env.ZEROMQ_PORT);
    sock.subscribe("raw");
    sock.on("message", function (topic, message) {
        try {
            var decoded = topic.toString("ascii");
            if (decoded === "rawtx") {
                var txd = bitcoincashZmqDecoder_1.decodeTransaction(message);
                io.emit("transactions", JSON.stringify(txd, null, 2));
            }
            else if (decoded === "rawblock") {
                var blck = bitcoincashZmqDecoder_1.decodeBlock(message);
                io.emit("blocks", JSON.stringify(blck, null, 2));
            }
        }
        catch (error) {
            var errorMessage = "Error processing ZMQ message";
            console.log(errorMessage, error);
            wlogger.error(errorMessage, error);
        }
    });
}
else {
    console.log("ZEROMQ_URL and ZEROMQ_PORT env vars missing. Skipping ZMQ connection.");
}
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
// Set the time before a timeout error is generated. This impacts testing and
// the handling of timeout errors. Is 10 seconds too agressive?
server.setTimeout(30 * 1000);
// Dump details about the event loop to debug a possible memory leak
wtfnode.setLogger("info", function (data) {
    wlogger.verbose("wtfnode info: " + data);
});
wtfnode.setLogger("warn", function (data) {
    wlogger.verbose("wtfnode warn: " + data);
});
wtfnode.setLogger("error", function (data) {
    wlogger.verbose("wtfnode error: " + data);
});
setInterval(function () {
    wtfnode.dump();
}, 60000 * 5);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== "listen")
        throw error;
    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
}
//
// module.exports = app;
