const toDecimalNumber = (baseAmount, decimals) => {
  const base = baseAmount.toString();
  let result = base;
  if (decimals !== 0) {
    if (decimals >= base.length) {
      result = `0.${'0'.repeat(decimals - base.length)}${base}`;
    } else {
      result = `${base.slice(0, base.length - decimals)}.${base.slice(base.length - decimals)}`;
    }
    while (result.endsWith('0')) {
      result = result.slice(0, -1);
    }
    if (result.endsWith('.')) {
      result = result.slice(0, -1);
    }
  }
  return result;
};

const displayToken = async (registry, token) => {
  await registry.methods.getFullTokenBalances(
    [token.tokenAdapterName],
    [token.token],
  )
    .call()
    .then((result) => {
      console.log(`${result[0].base.erc20metadata.name} amount: ${toDecimalNumber(
        token.amount,
        result[0].base.erc20metadata.decimals,
      )}`);
    });
};

export default displayToken;
