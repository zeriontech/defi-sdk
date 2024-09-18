// Returns the time of the last mined block in seconds
const latestTime = async () => {
  const block = await web3.eth.getBlock('latest');
  return block.timestamp;
};

export default latestTime;
