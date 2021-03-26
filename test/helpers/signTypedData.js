const signTypedData = async (wallet, typedData) => {
  ethers.utils.splitSignature(
    // eslint-disable-next-line no-underscore-dangle
    await wallet._signTypedData(typedData.domain, typedData.types, typedData.message),
  );
};

export default signTypedData;
