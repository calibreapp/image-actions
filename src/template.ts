import { join } from 'path'

import ejs from 'ejs'

const EJS_OPTIONS = { async: true }

const template = (basename: string, variables: any): Promise<string> => {
  const filePath = join(__dirname, 'markdown-templates', basename)
  return ejs.renderFile(filePath, variables, EJS_OPTIONS)
}

export default template
