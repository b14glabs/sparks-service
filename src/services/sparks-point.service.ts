
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

export const getTotalPointAgg = (holder: string) => {
  return SparksPoint.aggregate([
    {
      $match: {
        holder
      }
    },
    {
      $group:
      {
        _id: "$holder",
        totalPoint: {
          $sum: "$point"
        }
      }
    }
  ]) as unknown as { _id: string, totalPoint: number }[]
}

export const findSparkRecordsWithPagination = (
  filter: RootFilterQuery<ISparksPoint>,
  options: any
) => {
  return (SparksPoint as any).paginate(filter, options)
}
