## ws.bitcoin.com

### Installation

Install NodeJS [latest long term support](https://nodejs.org/en/) (LTS) version. Confirm it worked:

```
node -v
v10.15.3
```

Clone the git repo from github

```
git clone https://github.com/Bitcoin-com/ws.bitcoin.com.git
cd ws.bitcoin.com
```

Install the dependencies

```
npm install
```

Edit the `start-local-server` file and for the `ZEROMQ_URL` value add the IP address of your full node where you have bitcoin cash data streaming in real-time over zeromq.

```
#!/bin/bash

# Bitcoin.com staging websockets server
export ZEROMQ_PORT=28332
export ZEROMQ_URL=ip.address.of.node
export NETWORK=mainnet

npm start
```

Start the app.

```
./start-local-server

ws.bitcoin.com started on port 3000
Connecting to BCH ZMQ at ip.address.of.node:28332
```

Open a BITBOX console with [bitbox-cli](https://www.npmjs.com/package/bitbox-cli)

```
bitbox console
> let socket = new bitbox.Socket({
...   callback: () => {
.....     console.log("connected")
.....   },
...   restURL: "http://localhost:3000"
... })
connected
> socket.listen("transactions", message => {
...   console.log(message)
... })
> {
  "format": {
    "txid": "656e9c88acedfe97aea87ef8f750d5ae4cfd34d9f2c1bbcedfcb04f891ac58bf",
    "version": 1,
    "locktime": 0,
    "size": 271,
    "vsize": 271
  },
  "inputs": [
    {
      "txid": "23785a10ace5525a0d5c7b95cb35e70fe32f8cd93821ec91ef623e6467c43ae4",
      "n": 1,
      "script": "30440220552b9725f844f825d819b644dec43a3cdc1171a0157a1d8aef945522ab2e0a600220683e3ea8626bc2199f7d72971f61e18ba24ba3218d9e138f9e209d5563a9b78e41 0467ff2df20f28bc62ad188525868f41d461f7dab3c1e500314cdb5218e5637bfd0f9c02eb5b3f383f698d28ff13547eaf05dd9216130861dd0216824e9d7337e3",
      "sequence": 4294967295
    }

  ... real-time transactions data
```

You can also pass in `"blocks"` to get real-time block data over websockets

```js
let socket = new bitbox.Socket({
  callback: () => {
    console.log("connected")
  },
  restURL: "http://localhost:3000"
})
socket.listen("transactions", message => {
  console.log(message)
})
socket.listen("blocks", message => {
  console.log(message)
})
```
