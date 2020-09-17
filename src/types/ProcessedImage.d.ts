interface ProcessedImage {
  name: string
  path: string
  beforeStats: number
  afterStats: number
  percentChange: number
  compressionWasSignificant: boolean
}

interface ProcessedImageMetrics {
  bytesSaved: number
  percentChange: number
}

interface ProcessedImagesResult {
  metrics: ProcessedImageMetrics
  images: ProcessedImage[]
}
