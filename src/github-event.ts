import { promises as fsPromises } from 'fs'
const { readFile } = fsPromises

import { GITHUB_EVENT_PATH } from './constants'

const event = async () => {
  const buffer = await readFile(GITHUB_EVENT_PATH)
  return JSON.parse(buffer.toString())
}

export default event
