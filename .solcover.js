require('dotenv').config();

module.exports = {
  skipFiles: [],
  providerOptions: {
    accounts: [
      {
        secretKey: '0xbe5d6e330de6c44c137f8fb45fa44dada079fb8bc29d290cadd8f882035dd189',
        balance: '0x56BC75E2D63100000',
      },
      {
        secretKey: '0x473acc210edb35998de9dc65495bafbf0a3804950482cd2b48af7bba7046d7de',
        balance: '0x56BC75E2D63100000',
      },
    ],
    fork: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    gasLimit: 0x1fffffffffffff,
  },
  mocha: {
    enableTimeouts: false,
  },
};
