#!/bin/bash

# Team DO QA Testnet Wormhole Full Node
export RPC_BASEURL=http://localhost:18332/
export RPC_USERNAME=bitcoin
export RPC_PASSWORD=password
export ZEROMQ_PORT=28331
export ZEROMQ_URL=localhost
export NETWORK=testnet

#export BITDB_URL=https://tbitdb.bitcoin.com/

# Team DO QA Testnet Insight Server
export BITCOINCOM_BASEURL=http://localhost:3001/api/

npm start
