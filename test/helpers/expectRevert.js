const expectRevert = async (promise) => {
  try {
    await promise;
  } catch (error) {
    console.log(error.message);
    // TODO: Check jump destination to destinguish between a throw and an actual invalid jump.
    const invalidOpcode = error.message.search('revert') >= 0
      || error.message.search('invalid opcode') > -1;

    // TODO: When we contract A calls contract B, and B throws, instead of an 'invalid jump',
    //  we get an 'out of gas' error. How do we distinguish this from an actual out of gas event?
    //  The testrpc log actually show an 'invalid jump' event).
    const outOfGas = error.message.search('out of gas') > -1;

    assert(invalidOpcode || outOfGas, `Expected revert, got ${error} instead`);

    return;
  }

  assert(false, "Expected revert wasn't received");
};

export default expectRevert;
