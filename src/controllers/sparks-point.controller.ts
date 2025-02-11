import { Request, Response } from 'express'
import Web3 from 'web3'
import {
  findSparkRecordsWithPagination,
  getTotalPointAgg,
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
    const holder = req.params.holder.toLowerCase();
    const totalPointAgg = await getTotalPointAgg(holder)
    res.status(200).json({ holder, totalPoint: totalPointAgg.length ? totalPointAgg[0].totalPoint : 0 })
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
        holder: req.params.holder.toLowerCase(),
        type: { $eq: type },
      }
      : {
        holder: req.params.holder.toLowerCase(),
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
