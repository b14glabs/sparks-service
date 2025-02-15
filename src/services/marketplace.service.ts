import { MarketplaceStakeEvents, RewardReceivers, MarketplaceWithdrawEvents } from '../models'

export const getTotalBtcStakedOfUsers = async () => {
  const totalBtc = await RewardReceivers.aggregate([
    {
      $match: {
        unlockTime: { $gt: Math.floor(Date.now() / 1000) }
      },
    },
    {
      $group: {
        _id: '$from',
        btcAmount: {
          $sum: {
            $toDouble: '$amount',
          },
        },
      },
    },
  ]) as unknown as { _id: string, btcAmount: number }[]

  return totalBtc
}

export const getCurrentCoreStakedOfUsers = async () => {
  const now = new Date().getTime() / 1000

  const totalStake = await MarketplaceStakeEvents.aggregate([
    {
      $lookup:
      {
        from: "RewardReceivers",
        localField: "receiver",
        foreignField: "rewardReceiver",
        as: "data",
        pipeline: [
          {
            $match:
            {
              unlockTime: {
                $gt: now
              }
            }
          },
        ]
      }
    },
    {
      // size 0 means expired
      $match: {
        data: { $size: 1 }
      }
    },
    {
      $group:
      {
        _id: "$delegator",
        stake: {
          $sum: {
            $toDouble: "$amount"
          }
        }
      }
    }
  ]) as unknown as { _id: string, stake: number }[];
  const totalWithdrawn = await MarketplaceWithdrawEvents.aggregate([
    {
      $lookup:
      {
        from: "RewardReceivers",
        localField: "receiver",
        foreignField: "rewardReceiver",
        as: "data",
        pipeline: [
          {
            $match:
            {
              unlockTime: {
                $gt: now
              }
            }
          },
        ]
      }
    },
    {
      // size 0 means expired
      $match: {
        data: { $size: 1 }
      }
    },
    {
      $group:
      {
        _id: "$delegator",
        withdraw: {
          $sum: {
            $toDouble: "$amount"
          }
        }
      }
    }
  ]) as unknown as { _id: string, withdraw: number }[];
  return {
    stakeRecords: totalStake,
    withdrawRecords: totalWithdrawn
  }
}