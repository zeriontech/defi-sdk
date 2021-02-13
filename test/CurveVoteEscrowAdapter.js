const ProtocolAdapter = artifacts.require("CurveVoteEscrowAdapter");
const ERC20TokenAdapter = artifacts.require("ERC20TokenAdapter");
const AdapterRegistry = artifacts.require("AdapterRegistry");

contract("CurveVoteEscrowAdapter", () => {
  const veCrvAddress = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2";
  const crvAddress = "0xD533a949740bb3306d119CC777fa900bA034cd52";

  let accounts;
  let adapterRegistry;
  let protocolAdapter;
  let erc20TokenAdapterAddress;

  const veCrv = [veCrvAddress, "Vote-escrowed CRV", "veCRV", "18"];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await ProtocolAdapter.new({ from: accounts[0] }).then((result) => {
      protocolAdapter = result.contract;
    });
    await ERC20TokenAdapter.new({ from: accounts[0] }).then((result) => {
      erc20TokenAdapterAddress = result.address;
    });
    await AdapterRegistry.new({ from: accounts[0] }).then((result) => {
      adapterRegistry = result.contract;
    });
    await adapterRegistry.methods
      .addProtocols(
        ["Vote-escrowed CRV"],
        [
          [
            "Mock Protocol Name",
            "Mock protocol description",
            "Mock website",
            "Mock icon",
            "0",
          ],
        ],
        [[protocolAdapterAddress]],
        [[[veCrvAddress]]]
      )
      .send({
        from: accounts[0],
        gas: "1000000",
      });
    await adapterRegistry.methods
      .addTokenAdapters(["ERC20"], [erc20TokenAdapterAddress])
      .send({
        from: accounts[0],
        gas: "1000000",
      });
  });

  it("returns the correct balance", async () => {
    await protocolAdapter.methods["getBalance(token, account)"](
      crvAddress,
      accounts[0]
    )
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].base);
        assert.deepEqual(
          result[0].adapterBalances[0].balances[0].underlying[0].metadata,
          veCrv
        );
      });
  });
});
