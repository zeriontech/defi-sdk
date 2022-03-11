import { _TypedDataEncoder } from '@ethersproject/hash';

const hashTypedData = async (typedData) => {
  return _TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message);
};

export default hashTypedData;
