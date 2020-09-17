interface ProcessedImage {
  name: string
  path: string
  beforeStats: number
  afterStats: number
  percentChange: number
  compressionWasSignificant: boolean
}

interface ProcessedImageView extends ProcessedImage {
  formattedBeforeStats: string
  formattedAfterStats: string
  formattedPercentChange: string
  diffUrl?: string
}

interface ProcessedImageMetrics {
  bytesSaved: number
  percentChange: number
}

interface ProcessedImagesResult {
  metrics: ProcessedImageMetrics
  optimisedImages: ProcessedImage[]
  unoptimisedImages: ProcessedImage[]
}
