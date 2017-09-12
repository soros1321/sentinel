# Sentinel POC Beta

## Bootnode

Bootnodes are special nodes, through a node can join the network and find other nodes. For running a bootnode you must install ethereum in your system.

### Running a Bootnode

`bootnode -genkey bootnode.key`
This command will generate a private key and stores it in *bootnode.key* file

`bootnode -nodekey bootnode.key --verbosity 6`
This command will run the bootnode server on port *30301/udp*

### Building Sentinel Docker Image

`git clone https://github.com/sentinel-official/sentinel-py.git`

`cd sentinel-py`

`git checkout poc-beta`

`cd docker/node`

`docker build --tag sentinelbeta/node --compress --force-rm --no-cache .`

These above commands will build Sentinel docker image. To check run `docker images -a`

### Running a Sentinel Node

`docker run -it -p 30303:30303 -p 30303:30303/udp -p 8545:8545 sentinelbeta/node`

The above command will provide a JavaScript console

To see the connected peers run `admin.peers` in JS console. To know your node information run `admin.nodeInfo`

### Running an Ethereum wallet

`ethereumwallet --rpc http://127.0.0.1:8545 --network sentinel`

You can download Ethereum wallet from https://github.com/ethereum/mist/releases