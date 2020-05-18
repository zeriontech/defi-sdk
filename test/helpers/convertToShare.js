const convertToShare = (share) => {
  const { toWei } = web3.utils;
  return toWei(share.toString(), 'ether');
};

export default convertToShare;
