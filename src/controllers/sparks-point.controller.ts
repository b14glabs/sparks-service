import { Request, Response } from 'express'
import Web3 from 'web3'
import {
  countSparksHolder,
  findSparkRecordsWithPagination,
  getSparkPointRecords,

} from '../services'

export const getTotalPoint = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!Web3.utils.isAddress(req.params.holder)) {
      res.status(400).json({ error: 'holder is invalid address' })
      return
    }
    const holder = Web3.utils.toChecksumAddress(req.params.holder)

    let addressInfo

    const records = await getSparkPointRecords()

    const totalDocument = await countSparksHolder()

    const addressData = records
      .map((record, idx) => {
        if (Web3.utils.toChecksumAddress(record['_id']) === holder) {
          return {
            totalPoint: record['totalPoints'],
            rank: idx + 1,
            holder: record['_id'],
          }
        }
      })
      .filter((el) => el != undefined)

    addressInfo = addressData.length
      ? addressData[0]
      : {
          holder,
          rank: totalDocument.length ? totalDocument[0]['totalHolders'] + 1 : 0,
          totalPoint: 0,
        }

    res.status(200).json(addressInfo)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message || error })
  }
}

export const getHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 10
    if (isNaN(page) || page < 1) {
      res.status(400).send({ error: 'Invalid page number' })
      return
    }
    const type = req.query.type as string
    const query = type
      ? {
          holder: { $regex: `^${req.params.holder}$`, $options: 'i' },
          type: { $eq: type },
        }
      : {
          holder: { $regex: `^${req.params.holder}$`, $options: 'i' },
        }

    if (!Web3.utils.isAddress(req.params.holder)) {
      res.status(400).json({ error: 'holder is invalid address' })
      return
    }

    const result = await findSparkRecordsWithPagination(
      {
        ...query,
      },
      {
        sortBy: 'createdAt:desc',
        page,
        limit,
      }
    )

    res.status(200).json({
      holder: req.params.holder,
      ...result,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message || error })
  }
}
