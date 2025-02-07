
import { RootFilterQuery } from 'mongoose'
import { ISparksPoint, SparksPoint } from '../models'
import { TYPE } from '../const'

export const createSparkPoint = (data: ISparksPoint[]) => {
  return SparksPoint.insertMany(data, { ordered: false })
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
