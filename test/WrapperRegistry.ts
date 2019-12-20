import { ethers } from "@nomiclabs/buidler";
import chai from "chai";
import { deployContract, getWallets, solidity } from "ethereum-waffle";

import WrapperRegistryArtifact from "../build/WrapperRegistry.json";
import ProtocolWrapperArtifact from "../build/ProtocolWrapper.json";
import { WrapperRegistry } from "../typechain/WrapperRegistry";
import { ProtocolWrapper } from "../typechain/ProtocolWrapper";
import {BigNumber} from "ethers/utils";
import {JsonRpcProvider} from "ethers/providers";
import {Wallet} from "ethers";

chai.use(solidity);
const { expect } = chai;

describe("WrapperRegistry", () => {
  const provider: JsonRpcProvider = ethers.provider;
  const [wallet]: Wallet[] = getWallets(provider);
  let wrapperRegistry: WrappperRegistry;

  beforeEach(async () => {
    wrapperRegistry = await deployContract(wallet, WrapperRegistryArtifact) as WrapperRegistry;
    // const initialCount: BigNumber = await counter.getCount();

    // expect(initialCount).to.eq(0);
    // expect(counter.address).to.properAddress;
  });
});
