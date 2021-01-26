import translate = require('google-translate')

interface Translation {
  translatedText: string
}

interface GoogleTranslator {
  translate: (phrase: string, locale: string, callback: unknown) => void
}

export default class Translator {
  _translator?: GoogleTranslator

  init(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this._translator = translate(key)
  }

  async translate(phrase: string, locale: string): Promise<string> {
    if (this._translator === undefined)
      throw new Error('Please initialize the translator')
    return await new Promise((resolve): void => {
      this._translator?.translate(
        phrase,
        locale,
        (error: unknown, translation: Translation) => {
          if (error) throw error
          resolve(translation.translatedText)
        }
      )
    })
  }
}
