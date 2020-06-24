const displayToken = (token) => {
  const { BN } = web3.utils;
  let base;
  let weiAmount;
  let amount;
  if (token.metadata.decimals > 5) {
    base = new BN(10).pow(new BN(token.metadata.decimals - 5));
    weiAmount = new BN(token.amount);
    amount = weiAmount.divRound(base).toNumber() / 100000;
  } else {
    amount = token.amount;
  }

  // eslint-disable-next-line no-console
  console.log(`${token.metadata.name} amount: ${amount.toString()}`);
};

export default displayToken;
