require('dotenv').config();

module.exports = {
  skipFiles: [
    'Migrations.sol',
    'Logic.sol',
    'SignatureVerifier.sol',
  ],
  providerOptions: {
    accounts: [
      {
        secretKey: `${process.env.PRIVATE_KEY}`,
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0xbe5d6e330de6c44c137f8fb45fa44dada079fb8bc29d290cadd8f882035dd189',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x473acc210edb35998de9dc65495bafbf0a3804950482cd2b48af7bba7046d7de',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x3893470a6bcee2e2652eea6dddd6c677925453529313bddd86ce61fd29e06313',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x8bcaeea38f9d2ecb9719dc31b7dd8ef4d3a7c27fed7d2a5e29c15677f1d70a2d',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x159496cd9b1532e326dbb1759fb57dfca6722568690713032bab3b7a0aaf0fbd',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x3ce40f93372672923bda9fc1e8581428d02510c09418d9ebb8182b232234446d',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x92070709cd34955ec8aaf14b1b4cd8197ee4743189391072629538e52ef18014',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x0af73f5c72996143627524d0b22134e66d47e594b9598a94ef94ab1b781e7460',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x0272de3730704f4150e3c691cb2538ff22146affb578a845399a5def59f24e17',
        balance: '0x56BC75E2D63100000',
      },
    ],
    fork: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    gasLimit: 0x1fffffffffffff,
  },
  mocha: {
    enableTimeouts: false,
  }
};
