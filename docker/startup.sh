#!/bin/bash

# Team DO QA Testnet Wormhole Full Node
export RPC_BASEURL=http://localhost:18332/
export RPC_USERNAME=bitcoin
export RPC_PASSWORD=password
export ZEROMQ_PORT=28331
export ZEROMQ_URL=localhost
export NETWORK=testnet

npm start
