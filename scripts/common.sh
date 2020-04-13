#!/usr/bin/env bash

if [[ -z $PRIVATE_KEY ]]; then
  PRIVATE_KEY=$(grep PRIVATE_KEY .env | cut -d '=' -f2 | cut -d '"' -f2)
fi

balance="100000000000000000000"
accounts=""

acc=( \
    $PRIVATE_KEY \
    0x60fabb813c1cd5a39a3d7a871a872a854017fd32979df9ca63079d50fa76cb8f \
    0xbe5d6e330de6c44c137f8fb45fa44dada079fb8bc29d290cadd8f882035dd189 \
    0x473acc210edb35998de9dc65495bafbf0a3804950482cd2b48af7bba7046d7de \
    0x3893470a6bcee2e2652eea6dddd6c677925453529313bddd86ce61fd29e06313 \
    0x8bcaeea38f9d2ecb9719dc31b7dd8ef4d3a7c27fed7d2a5e29c15677f1d70a2d \
    0x159496cd9b1532e326dbb1759fb57dfca6722568690713032bab3b7a0aaf0fbd \
    0x3ce40f93372672923bda9fc1e8581428d02510c09418d9ebb8182b232234446d \
    0x92070709cd34955ec8aaf14b1b4cd8197ee4743189391072629538e52ef18014 \
    0x0af73f5c72996143627524d0b22134e66d47e594b9598a94ef94ab1b781e7460 \
    0x0272de3730704f4150e3c691cb2538ff22146affb578a845399a5def59f24e17 \
    )

# Prepare a ganache accounts parameter string like --account="0x11c..,1000" --account="0xc5d...,1000" ....
for a in ${acc[@]}; do
  accounts=$accounts" --account=${a},${balance}"
done

# Helper funcs.

# Test if ganache is running on port $1.
# Result is in $?
ganache_running() {
  nc -z localhost $1
}

# Kills ganache process with its PID in $ganache_pid.
cleanup() {
  echo "cleaning up"
  # Kill the ganache instance that we started (if we started one).
  if [ -n "$ganache_pid" ]; then
    kill -9 $ganache_pid
  fi
}
