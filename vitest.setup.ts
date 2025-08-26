import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

process.env.GITHUB_EVENT_PATH =
  '__tests__/fixtures/pull-request-synchronize-event.json'
process.env.GITHUB_REPOSITORY = 'calibreapp/image-actions-test-repo'
process.env.GITHUB_OUTPUT = '/tmp/github_output.txt'

// Ensure the output file exists for GitHub Actions core.setOutput()
try {
  mkdirSync(dirname(process.env.GITHUB_OUTPUT!), { recursive: true })
  writeFileSync(process.env.GITHUB_OUTPUT!, '')
} catch (error) {
  // File might already exist, that's okay
}
