// Control characters and line breaks
const UNSAFE_CHARACTERS =
  /[\p{Control}\p{Line_Separator}\p{Paragraph_Separator}]/u
const UNSAFE_CHARACTERS_GLOBAL =
  /[\p{Control}\p{Line_Separator}\p{Paragraph_Separator}]/gu
const PRINTABLE_ASCII = /[\x21-\x7e]/g
const MARKDOWN_SAFE = /[A-Za-z0-9./-]/
const REPLACEMENT_CHARACTER = String.fromCharCode(0xfffd)

const hasControlCharacters = (value: string): boolean =>
  UNSAFE_CHARACTERS.test(value)

const sanitiseForLog = (value: string): string =>
  value.replace(UNSAFE_CHARACTERS_GLOBAL, REPLACEMENT_CHARACTER)

const escapeMarkdown = (value: string): string =>
  sanitiseForLog(value).replace(PRINTABLE_ASCII, character =>
    MARKDOWN_SAFE.test(character) ? character : `&#${character.charCodeAt(0)};`
  )

export { hasControlCharacters, sanitiseForLog, escapeMarkdown }
