import { TYPE } from "../const";
import { ISparksPoint } from "../models";
import { checkSavedSparkPointToday, createSparkPoint, getCurrentCoreStakedOfUsers, getTodayDualCoreRecords, getTotalBtcStakedOfUsers } from "../services"
import { calSparksPoint, convertDualCorePrice, getPrices } from "../util";
export const snapshot = async () => {
  try {
    const current = new Date();
    const utcHour = current.getUTCHours()
    if (utcHour < 5) return
    const check = await checkSavedSparkPointToday()
    if (check) {
      console.log("already saved today")
      return
    }
    const { btcPrice, corePrice } = await getPrices()
    const dualCore = await getTodayDualCoreRecords();
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

    await createSparkPoint(records)
  } catch (error) {
    console.error(error)
  } finally {
    console.log("wait 20m")
    setTimeout(() => {
      snapshot()
    }, 1000 * 60 * 20)
  }
}
