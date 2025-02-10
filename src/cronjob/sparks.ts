import { TYPE } from "../const";
import { ISparksPoint } from "../models";
import { checkSavedSparkPointToday, createSparkPoint, getCurrentCoreStakedOfUsers, getTodayDualCoreRecords, getTotalBtcStakedOfUsers } from "../services"
import { calSparksPoint, convertDualCorePrice, getPrices } from "../util";
import { backup, log, sleepTimeToNextSnapshot } from "../helper";

let sleepTime = sleepTimeToNextSnapshot();
let firstRun = true
export const snapshot = async () => {
  try {
    if (firstRun) {
      firstRun = false
      return
    }
    const check = await checkSavedSparkPointToday()
    if (check) {
      sleepTime = sleepTimeToNextSnapshot(true)
      return
    }
    

    log("Snapshot start")
    const { btcPrice, corePrice } = await getPrices()
    const dualCore = await getTodayDualCoreRecords();
    if (!dualCore.length) {
      log("no dual core snapshot right now.")
      return
    }
    const btc = await getTotalBtcStakedOfUsers()
    const { stakeRecords, withdrawRecords } = await getCurrentCoreStakedOfUsers()
    const hashmap: Record<string, {
      dualCore: bigint,
      core: bigint,
      btc: bigint
    }> = {}
    const data = [...dualCore, ...btc, ...stakeRecords, ...withdrawRecords] as any
    data.forEach(el => {
      const holder = el?.holder ? el.holder.toLowerCase() : el._id.toLowerCase()
      if (!(holder in hashmap)) {
        hashmap[holder] = {
          btc: BigInt(0),
          core: BigInt(0),
          dualCore: BigInt(0)
        }
      }
      if (el?.type === TYPE.DUAL_CORE_SNAPSHOT) {
        hashmap[holder].dualCore += BigInt(el.amount)
      }

      if (el.btcAmount) {
        hashmap[holder].btc += BigInt(el.btcAmount)
      }

      if (el.stake) {
        hashmap[holder].core += BigInt(el.stake)
      }
      if (el.withdraw) {
        hashmap[holder].core -= BigInt(el.withdraw)
      }
    })
    const dualCorePrice = +(await convertDualCorePrice(corePrice)).toFixed(6)

    const records: ISparksPoint[] = []
    Object.keys(hashmap).map(address => {
      return {
        address,
        ...hashmap[address]
      }
    }).filter(el => el.core >= BigInt(0)).forEach(item => {
      const dualCore = calSparksPoint(TYPE.DUAL_CORE_SNAPSHOT, item.dualCore, dualCorePrice);
      const btc = calSparksPoint(TYPE.STAKE_BTC, item.btc, btcPrice);
      const core = calSparksPoint(TYPE.STAKE_CORE, item.core, corePrice);
      if (dualCore.point) {
        records.push({
          amount: item.dualCore.toString(),
          holder: item.address,
          point: +dualCore.point.toFixed(6),
          type: TYPE.DUAL_CORE_SNAPSHOT,
          mutiplier: dualCore.multiplier,
          price: dualCorePrice
        })
      }
      if (btc.point) {
        records.push({
          amount: item.btc.toString(),
          holder: item.address,
          point: +btc.point.toFixed(6),
          type: TYPE.STAKE_BTC,
          mutiplier: btc.multiplier,
          price: btcPrice
        })
      }
      if (core.point) {
        records.push({
          amount: item.core.toString(),
          holder: item.address,
          point: +core.point.toFixed(6),
          type: TYPE.STAKE_CORE,
          mutiplier: core.multiplier,
          price: corePrice
        })
      }
    })
    backup(records)
    await createSparkPoint(records)
    log("Snapshot done")
    sleepTime = sleepTimeToNextSnapshot(true)
  } catch (error) {
    log(error)
  } finally {
    console.log(`wait ${sleepTime / (1000 * 60)}m`)
    setTimeout(() => {
      snapshot()
    }, sleepTime)
  }
}
