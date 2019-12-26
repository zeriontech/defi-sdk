module.exports = {
    testCommand: 'node --max-old-space-size=4096 npx truffle test --network coverage',
    compileCommand: 'node --max-old-space-size=4096 npx truffle compile --network coverage',
    norpc: true,
    skipFiles: [
        'Migrations.sol'
    ],
    providerOptions: {
        "fork": ""
    }
};
