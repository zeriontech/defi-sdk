#!/usr/bin/env bash

if [[ -z $INFURA_API_KEY ]]; then
  INFURA_API_KEY=$(grep INFURA_API_KEY .env | cut -d '=' -f2 | cut -d '"' -f2)
fi

# Import common variables.
. scripts/common.sh

# Executes cleanup function at script exit.
trap cleanup EXIT

if ganache_running 8545; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"

  npx ganache-cli $accounts -p 8545 -l 10000000 -g 1000000000 \
  -f https://mainnet.infura.io/v3/$INFURA_API_KEY > ganache.log & ganache_pid=$!
fi

# Run the truffle test or the solidity-coverage suite.
node --max-old-space-size=4096 ./node_modules/.bin/truffle test "$@"
