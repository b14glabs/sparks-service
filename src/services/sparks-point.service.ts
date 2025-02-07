
import { RootFilterQuery } from 'mongoose'
import { ISparksPoint, SparksPoint } from '../models'

export const createSparkPoint = (data: ISparksPoint[]) => {
  return SparksPoint.insertMany(data, { ordered: false })
}

export const checkSavedSparkPointToday = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return SparksPoint.findOne({
    createdAt: { "$gte": today },
  })
}

export const getSparkPointRecords = () => {
  return SparksPoint.aggregate<{ _id: string; totalPoints: number }>([
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

export const findSparkPoint = (filter: RootFilterQuery<ISparksPoint>) => {
  return SparksPoint.findOne(filter)
}

export const countSparksHolder = () => {
  return SparksPoint.aggregate<{ totalHolders: number }>([
    {
      $group: { _id: '$holder' },
    },
    {
      $count: 'totalHolders',
    },
  ])
}

export const countSparkRecordsByHolder = (holder: string) => {
  return SparksPoint.countDocuments({ holder })
}

export const findSparkRecordsWithPagination = (
  filter: RootFilterQuery<ISparksPoint>,
  options: any
) => {
  return (SparksPoint as any).paginate(filter, options)
}
