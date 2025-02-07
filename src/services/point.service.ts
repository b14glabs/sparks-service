import { RootFilterQuery } from 'mongoose'
import { IPoint, Point } from '../models'
import { TYPE } from '../const';

export const getPointRecords = () => {
  return Point.aggregate<{ _id: string; totalPoints: number }>([
    {
      $group: {
        _id: '$holder',
        totalPoints: { $sum: '$point' },
      },
    },
    {
      $sort: {
        totalPoints: -1,
      },
    },
  ])
}

export const getTodayDualCoreRecords = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Point.find({
    createdAt: { "$gte": today },
    type: TYPE.DUAL_CORE_SNAPSHOT
  })
}


export const findPoint = (filter: RootFilterQuery<IPoint>) => {
  return Point.findOne(filter)
}

export const getHolders = () => {
  return Point.distinct("holder")
}

export const countHolder = () => {
  return Point.aggregate<{ totalHolders: number }>([
    {
      $group: { _id: '$holder' },
    },
    {
      $count: 'totalHolders',
    },
  ])
}

