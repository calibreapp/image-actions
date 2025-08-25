import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import ejs from 'ejs'

const EJS_OPTIONS = { async: true }

const __dirname = dirname(fileURLToPath(import.meta.url))

const template = (basename: string, variables: any): Promise<string> => {
  const filePath = join(__dirname, '..', 'markdown-templates', basename)
  return ejs.renderFile(filePath, variables, EJS_OPTIONS)
}

export default template
