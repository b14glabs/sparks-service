import { MarketplaceStakeEvents, RewardReceivers, MarketplaceWithdrawEvents } from '../models'

export const getTotalBtcStakedOfUsers = async () => {
  const totalBtc = await RewardReceivers.aggregate([
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
    {
      $match: {
        btcAmount: { $gt: 0 },
      },
    },
    {
      $project: {
        _id: 1,
        btcAmount: 1,
      },
    },
  ]) as unknown as { _id: string, btcAmount: number }[]

  return totalBtc
}

export const getCurrentCoreStakedOfUsers = async () => {
  const now = new Date().getTime() / 1000

  const totalStake = await MarketplaceStakeEvents.aggregate([
    {
      $group: {
        _id: "$delegator",
        amount: { $sum: { $toDouble: "$amount" } },
        receiver: { $first: "$receiver" }
      }
    },
    {
      $lookup: {
        from: 'RewardReceivers',
        localField: 'receiver',
        foreignField: 'rewardReceiver',
        as: 'expiredReceiver',
        pipeline: [
          {
            $project: {
              _id: 0,
              rewardReceiver: 1,
              unlockTime: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$expiredReceiver',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'expiredReceiver.unlockTime': { $gt: now },
      },
    },
    {
      $group: {
        _id: '$_id',
        stake: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 1,
        stake: 1,
      },
    },
  ]) as unknown as { _id: string, stake: number }[];
  const totalWithdrawn = await MarketplaceWithdrawEvents.aggregate([
    {
      $group: {
        _id: "$delegator",
        amount: { $sum: { $toDouble: "$amount" } },
        receiver: { $first: "$receiver" }
      }
    },
    {
      $lookup: {
        from: 'RewardReceivers',
        localField: 'receiver',
        foreignField: 'rewardReceiver',
        as: 'expiredReceiver',
        pipeline: [
          {
            $project: {
              _id: 0,
              rewardReceiver: 1,
              unlockTime: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$expiredReceiver',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'expiredReceiver.unlockTime': { $gt: now },
      },
    },
    {
      $group: {
        _id: '$_id',
        withdraw: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 1,
        withdraw: 1,
      },
    },
  ]) as unknown as { _id: string, withdraw: number }[];
  return {
    stakeRecords: totalStake,
    withdrawRecords: totalWithdrawn
  }
}