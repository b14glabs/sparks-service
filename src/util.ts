import { Contract, JsonRpcProvider, formatEther, formatUnits, parseEther, parseUnits } from "ethers";
import { TYPE } from "./const";
import { VAULT_ADDRESS } from './const'
import coreVaultAbi from "./abi/coreVault.json"
import axios from "axios";

const calMultiplier = (type: TYPE, amount: bigint) => {
  if (type === TYPE.DUAL_CORE_SNAPSHOT) return 5;
  if (type === TYPE.STAKE_CORE) {
    if (amount < parseEther("100")) return 0;
    if (amount <= parseEther("5000")) return 1;
    if (amount <= parseEther("10000")) return 2;
    return 4;
  }

  if (type === TYPE.STAKE_BTC) {
    if (amount < parseUnits("0.01", 8)) return 0;
    if (amount <= parseUnits("5", 8)) return 1;
    if (amount <= parseUnits("10", 8)) return 2;
    return 3;
  }
}

export const convertDualCorePrice = async (corePrice: number) => {
  const jsonRpc = new JsonRpcProvider(process.env.RPC_URL)
  const coreVaultContract = new Contract(
    VAULT_ADDRESS,
    coreVaultAbi,
    jsonRpc
  )
  const exchangeRate = await coreVaultContract.exchangeCore.staticCall(parseEther("1")) as bigint
  return corePrice / +formatEther(exchangeRate)
}


export const calSparksPoint = (type: TYPE, amount: bigint, price: number) => {
  const multiplier = calMultiplier(type, amount)
  if (multiplier === 0) return {
    point: 0,
    multiplier
  };
  const amountCalculate = type === TYPE.STAKE_BTC ? +formatUnits(amount, 8) : +formatEther(amount)
  return {
    point: amountCalculate * multiplier * price,
    multiplier
  }
}

export const getPrices = async () => {
  const res = await axios.post("https://stake.coredao.org/api/staking/market/price");
  if (res.status === 200) {
    if (res.data.data.marketPriceList[0].pair === 'CORE-USDT') {
      return {
        corePrice: res.data.data.marketPriceList[0].lastTxPrice,
        btcPrice: res.data.data.marketPriceList[1].lastTxPrice
      }
    }
    return {
      btcPrice: res.data.data.marketPriceList[0].lastTxPrice,
      corePrice: res.data.data.marketPriceList[1].lastTxPrice
    }

  }
}
