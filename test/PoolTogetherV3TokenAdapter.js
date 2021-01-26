const TokenAdapter = artifacts.require('PoolTogetherV3TokenAdapter');

contract('PoolTogetherV3TokenAdapter', () => {
  const pcUNIAddress = '0xA92a861FC11b99b24296aF880011B47F9cAFb5ab';
  const uniAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';

  let accounts;
  let tokenAdapter;
  const pcUNI = [
    pcUNIAddress,
    'PoolTogether UNI Ticket (Compound)',
    'PcUNI',
    '18',
  ];
  const pcUNIComponents = [
    [
      uniAddress,
      'ERC20',
      '1000000000000000000',
    ],
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapter = result.contract;
      });
  });

  it('should return correct components', async () => {
    await tokenAdapter.methods['getComponents(address)'](pcUNIAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, pcUNIComponents);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](pcUNIAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, pcUNI);
      });
  });
});
