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
  price: {
    type: Number,
  },
  mutiplier: Number,
}


const pointSchema = new Schema(schemaDefinition, {
  timestamps: { createdAt: true, updatedAt: true },
  collection: 'sparks_point',
})
pointSchema.plugin(paginate)

export type ISparksPoint = InferRawDocType<typeof schemaDefinition>
export const SparksPoint = model('Sparks-Point', pointSchema)
