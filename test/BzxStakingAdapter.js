const ProtocolAdapter = artifacts.require('BzxStakingAdapter');

contract('BzxStakingAdapter', () => {

  const bzxBalancerAddress = '0xe26A220a341EAca116bDa64cF9D5638A935ae629';
  const bzxCurve3CRVAddress = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490';
  const bzxvBZRXAddress = '0xB72B31907C1C95F3650b64b2469e08EdACeE5e8F';
  const bzxBZRXAddress = '0x56d811088235F11C8920698a204A5010a788f4b3';
  const iBZRXAddress = '0x18240BD9C07fA6156Ce3F3f61921cC82b2619157';

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

  it('should return correct balances for bzxBalancerAddress', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](bzxBalancerAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct balances for bzxCurve3CRVAddress', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](bzxCurve3CRVAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct balances for bzxvBZRXAddress', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](bzxvBZRXAddress, testAddress)
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

  it('should return correct balances for iBZRXAddress', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](iBZRXAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
