import { InferRawDocType, Schema, model } from 'mongoose'
const schemaDefinition = {
  holder: {
    type: String,
    required: true,
  },
  point: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  coreReward: String,
  rewardBy: String,
  rewardType: String,
  txId: {
    type: String,
  },
  receiver: {
    type: String
  },
  isBtcClaim: Boolean,
  amount: String,
  time: Date,
}

const pointSchema = new Schema(schemaDefinition, {
  timestamps: { createdAt: true, updatedAt: true },
  collection: 'point',
})
export type IPoint = InferRawDocType<typeof schemaDefinition>
export const Point = model('Point', pointSchema)
