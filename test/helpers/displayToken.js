const displayToken = async (registry, token) => {
  const { BN } = web3.utils;
  const base = new BN(10).pow(new BN(token.metadata.erc20.decimals - 5));
  const weiAmount = new BN(token.amount);
  let amount = weiAmount.divRound(base).toNumber() / 100000;
  console.log(`${token.metadata.erc20.name} amount: ${amount.toString()}`);
  await registry.methods.getFinalFullTokenBalances(
    [token.metadata.tokenAddress],
    [token.metadata.tokenType],
  )
    .call()
    .then((result) => {
      if (result[0].underlying.length > 0) {
        let underlyingBase;
        let underlyingWeiAmount;
        result[0].underlying.forEach((underlyingToken) => {
          underlyingBase = new BN(10).pow(new BN(underlyingToken.metadata.erc20.decimals - 5));
          underlyingWeiAmount = weiAmount
            .mul(new BN(underlyingToken.amount))
            .div(new BN(10).pow(new BN(18)));
          amount = underlyingWeiAmount.divRound(underlyingBase).toNumber() / 100000;
          console.log(
            `${underlyingToken.metadata.erc20.name} amount: ${amount.toString()}`,
          );
        });
      }
    });
};

export default displayToken;
