const displayToken = (token) => {
  const amountString = token.amount.toString();
  let amount;
  if (token.metadata.decimals > 0) {
    if (amountString.length > token.metadata.decimals) {
      const intPartLength = amountString.length - token.metadata.decimals;
      const decimalPart = amountString.slice(intPartLength).replace(/0+$/, '');
      amount = `${amountString.slice(0, intPartLength)}.${decimalPart}`;
    } else {
      const zeroPartLength = token.metadata.decimals - amountString.length;
      const decimalPart = amountString.replace(/0+$/, '');
      amount = `0.${'0'.repeat(zeroPartLength)}${decimalPart}`;
    }
  } else {
    amount = token.amount.toString();
  }
  // eslint-disable-next-line no-console
  console.log(`${token.metadata.name} amount: ${amount}`);
};

export default displayToken;
