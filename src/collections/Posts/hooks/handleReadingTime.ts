import { CollectionBeforeChangeHook } from 'payload'
import { calculateReadingTime } from '@/utilities/calculateReadingTime'

export const handleReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  if (data && data.content) {
    data.readingTime = calculateReadingTime(data.content)
  }
  return data
}
