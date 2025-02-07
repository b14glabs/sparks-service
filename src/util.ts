import { Contract, JsonRpcProvider, formatEther, formatUnits, parseEther, parseUnits } from "ethers";
import { TYPE } from "./const";
import { VAULT_ADDRESS } from './const'
import coreVaultAbi from "./abi/coreVault.json"

const calMultiplier = (type: TYPE, amount: bigint) => {
  if (type === TYPE.DUAL_CORE_SNAPSHOT) return 3;
  if (type === TYPE.STAKE_CORE) {
    if (amount < parseEther("2000")) return 0;
    if (amount < parseEther("5000")) return 1;
    if (amount < parseEther("10000")) return 2;
    return 3;
  }

  if (type === TYPE.STAKE_BTC) {
    if (amount < parseUnits("0.01", 8)) return 0;
    if (amount < parseUnits("0.1", 8)) return 1;
    if (amount < parseUnits("1", 8)) return 2;
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
  if (multiplier === 0) return 0;
  const amountCalculate = type === TYPE.STAKE_BTC ? +formatUnits(amount, 8) : +formatEther(amount)
  return amountCalculate * multiplier * price
}
