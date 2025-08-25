import type { ProcessedImagesResult } from './ProcessedImage.d.ts'

export interface ActionSummaryReport {
  processingResults: ProcessedImagesResult
  commitSha?: string
}
