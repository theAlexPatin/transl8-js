let Translator
let VERBOSITY

const logger = {
  error(...args) {
    if (VERBOSITY < 3) return
    // eslint-disable-next-line no-console
    console.log('[Error]', ...args)
  },
  info(...args) {
    if (VERBOSITY < 2) return
    // eslint-disable-next-line no-console
    console.log('[Info]', ...args)
  },
  warn(...args) {
    if (VERBOSITY < 1) return
    // eslint-disable-next-line no-console
    console.warn('[Warning]', ...args)
  },
}

const cleanCharacters = dirtyString =>
  [/'/gi, /"/gi, /\)/gi, /\r/gi, /\n/gi, /()/gi].reduce(
    (cleanString, regex) => cleanString.replace(regex, ''),
    dirtyString
  )

/**
 * @todo remove variables before translation and replace after
 * @todo handle list formatting
 * @todo handle linked locale messages
 * @param {string} phrase - original phrase
 * @param {string} translated - translated result
 */
const formatVars = (phrase, translated) => {
  try {
    const regex = /\{.*?\}/
    const variables = []
    while (regex.test(phrase)) {
      variables.push(phrase.match(regex)[0])
      phrase = phrase.replace(phrase.match(regex)[0], '')
      translated = translated.replace(translated.match(regex)[0], '$I18N_VAR$')
    }
    for (const i in variables) {
      translated = translated.replace('$I18N_VAR$', variables[i])
    }
    return translated
  } catch (error) {
    logger.warn(error.message)
    logger.error(error)
    return translated
  }
}

const translatePhrase = async (phrase, locale) =>
  formatVars(
    phrase,
    (
      await Promise.all(
        phrase.split('|').map(
          part =>
            new Promise(resolve => {
              Translator.translate(part, locale, (error, translation) => {
                if (error) {
                  logger.warn(error.message)
                  logger.error(error)
                  return resolve(phrase)
                }

                if (!translation || !translation.translatedText)
                  return resolve(phrase)
                return resolve(cleanCharacters(translation.translatedText))
              })
            })
        )
      )
    ).join(' | ')
  )

const translateObject = async (object, locale) => {
  const translations = []
  for (const key in object) {
    const value = object[key]
    if (typeof value !== 'string')
      translations.push({
        key,
        promise: translateObject(value, locale),
      })
    else
      translations.push({
        key,
        promise: translatePhrase(value, locale),
      })
  }
  const results = await Promise.all(translations.map(t => t.promise))
  return results.reduce(
    (acc, result, i) => Object.assign(acc, { [translations[i].key]: result }),
    {}
  )
}

module.exports = async params => {
  try {
    const { key, source, locales } = params
    if (!key || !source || !locales) throw new Error('Missing Arguments')
    Translator = require('google-translate')(key)
    const results = await Promise.all(
      locales.map(locale => translateObject(source, locale))
    )
    return results.reduce(
      (acc, result, i) => Object.assign(acc, { [locales[i]]: result }),
      {}
    )
  } catch (error) {
    logger.warn(error.message)
    logger.error(error)
  }
}
