const displayToken = (token) => {
  const { BN } = web3.utils;
  const base = new BN(10).pow(new BN(token.metadata.decimals - 5));
  const weiAmount = new BN(token.amount);
  const amount = weiAmount.divRound(base).toNumber() / 100000;
  console.log(`${token.metadata.name} amount: ${amount.toString()}`);
};

export default displayToken;
