import { InferRawDocType, Schema, model } from 'mongoose'
import { paginate } from './plugin/pagination.plugin'

const schemaDefinition = {
  holder: {
    type: String,
    required: true,
    lowercase: true
  },
  point: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  corePrice: {
    type: Number,
    required: true
  },
  mutiplier: Number
}


const pointSchema = new Schema(schemaDefinition, {
  timestamps: { createdAt: true, updatedAt: true },
  collection: 'sparks_point',
})
pointSchema.plugin(paginate)
// for dual core
pointSchema.index(
  {
    time: 1,
    holder: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      time: { $type: 'date' },
      type: { $eq: 'dual-core-snapshot' },
    },
  }
)
//pointSchema.index({
//  type: 1,
//  holder: 1,
//  createdAt: 1,
//  point: 1,
//  receiver: 1,
//  txId: 1,
//}, {
//  unique: true,
//  sparse: true
//})

export type ISparksPoint = InferRawDocType<typeof schemaDefinition>
export const SparksPoint = model('Sparks-Point', pointSchema)
