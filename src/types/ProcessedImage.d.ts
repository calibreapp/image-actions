export interface ProcessedImage {
  name: string
  path: string
  beforeStats: number
  afterStats: number
  percentChange: number
  compressionWasSignificant: boolean
}

export interface ProcessedImageView extends ProcessedImage {
  formattedBeforeStats: string
  formattedAfterStats: string
  formattedPercentChange: string
  diffUrl?: string
}

export interface ProcessedImageMetrics {
  bytesSaved: number
  percentChange: number
}

export interface ProcessedImagesResult {
  metrics: ProcessedImageMetrics
  optimisedImages: ProcessedImage[]
  unoptimisedImages: ProcessedImage[]
}
