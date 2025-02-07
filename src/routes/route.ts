import { Router } from 'express'
import apicache from 'apicache'
import {
  getTotalPoint,
  getHistory,
} from '../controllers/sparks-point.controller'

const router: Router = Router()

const cache = apicache.middleware

router.get('/total-point/:holder', cache('1 minute'), getTotalPoint)
router.get('/history/:holder', cache('1 minute'), getHistory)

export default router
