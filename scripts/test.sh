#!/usr/bin/env bash

if [[ -z $INFURA_API_KEY ]];
then
  INFURA_API_KEY=$(grep INFURA_API_KEY .env | cut -d '=' -f2 | cut -d '"' -f2)
fi

if [ "$SOLIDITY_COVERAGE" = true ]; then
  port=8555
else
  port=8545
fi

# Import common variables.
. scripts/common.sh

# Executes cleanup function at script exit.
trap cleanup EXIT

if ganache_running $port; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"

  if [ "$SOLIDITY_COVERAGE" = true ]; then
    npx testrpc-sc -l 0xfffffffffff $accounts -p "$port" > ganache.log &
  else
    npx ganache-cli $accounts -p "$port" -f https://mainnet.infura.io/v3/$INFURA_API_KEY@9165725 > ganache.log &
  fi

  ganache_pid=$!
fi

# Run the truffle test or the solidity-coverage suite.
if [ "$SOLIDITY_COVERAGE" = true ]; then
  SOLIDITY_COVERAGE=true npx solidity-coverage
else
  npx truffle test "$@"
fi
