import { join } from 'path'

import ejs from 'ejs'

const TEMPLATE_DIR = 'src/markdown-templates'
const EJS_OPTIONS = { async: true }

const template = (basename: string, variables: any): Promise<string> => {
  const filePath = join(TEMPLATE_DIR, basename)
  return ejs.renderFile(filePath, variables, EJS_OPTIONS)
}

export default template
