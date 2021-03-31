const ProtocolAdapter = artifacts.require('BzxVestingStakingAdapter');

contract('BzxVestingStakingAdapter', () => {

  const bzxCurve3CRVAddress = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490';
  const bzxBZRXAddress = '0x56d811088235F11C8920698a204A5010a788f4b3';

  const testAddress = '0x00364d17C57868380Ef4F4effe8caf74d757742D';

  let accounts;
  let protocolAdapterContract;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterContract = result.contract;
      });
  });

  it('should return correct balances for bzxCurve3CRVAddress', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](bzxCurve3CRVAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct balances for bzxBZRXAddress', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](bzxBZRXAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
