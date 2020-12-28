const signTypedData = async (account, data) => new Promise((resolve, reject) => {
  web3.currentProvider.send({
    jsonrpc: '2.0',
    method: 'eth_signTypedData',
    params: [account, data],
    id: new Date().getTime(),
  }, (err, response) => {
    if (err) {
      return reject(err);
    }
    return resolve(response.result);
  });
});

export default signTypedData;
