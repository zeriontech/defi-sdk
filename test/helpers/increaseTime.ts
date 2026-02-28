import { ethers } from 'hardhat';
import latestTime from './latestTime';

// Increases ganache time by the passed duration in seconds
function increaseTime(duration: number): Promise<any> {
  const id = Date.now();

  return new Promise((resolve, reject) => {
    (ethers.provider as any).send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id,
      },
      (err1: any) => {
        if (err1) {
          return reject(err1);
        }
        return (ethers.provider as any).send(
          {
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1,
          },
          (err2: any, res: any) => (err2 ? reject(err2) : resolve(res)),
        );
      },
    );
  });
}

/**
 * Beware that due to the need of calling two separate ganache methods and rpc calls overhead
 * it's hard to increase time precisely to a target point so design your test to tolerate
 * small fluctuations from time to time.
 *
 * @param target time in seconds
 */
async function increaseTimeTo(target: number): Promise<any> {
  const now = await latestTime();

  if (target < now) {
    throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  }
  const diff = target - now;
  return increaseTime(diff);
}

const duration = {
  seconds(val: number): number {
    return val;
  },
  minutes(val: number): number {
    return val * this.seconds(60);
  },
  hours(val: number): number {
    return val * this.minutes(60);
  },
  days(val: number): number {
    return val * this.hours(24);
  },
  weeks(val: number): number {
    return val * this.days(7);
  },
  years(val: number): number {
    return val * this.days(365);
  },
};

export { increaseTimeTo, increaseTime, duration }; 
