import { Arguments, LocaleMap, Options } from '@/types'

import Logger from './logger'
import Translator from './translator'

interface Translation {
  key: string
  promise: Promise<unknown>
}

const logger = new Logger()

const translator = new Translator()

/**
 * Cleans a dirty string
 *
 * @param dirtyString A potentially dirty string
 */
const cleanCharacters = (dirtyString: string): string =>
  [/'/gi, /"/gi, /\)/gi, /\r/gi, /\n/gi, /()/gi].reduce(
    (cleanString, regex) => cleanString.replace(regex, ''),
    dirtyString
  )

/**
 * @todo remove variables before translation and replace after
 * @todo handle list formatting
 * @todo handle linked locale messages
 * @param phrase - original phrase
 * @param translated - translated result
 */
const formatVars = (phrase: string, translated: string): string => {
  try {
    const regex = /\{.*?\}/
    const variables = []
    while (regex.test(phrase)) {
      const match = phrase.match(regex)?.[0] ?? ''
      variables.push(match)
      phrase = phrase.replace(match, '')
      translated = translated.replace(
        translated.match(regex)?.[0] ?? '',
        '$I18N_VAR$'
      )
    }
    variables.forEach(variable => {
      translated = translated.replace('$I18N_VAR$', variable)
    })
    return translated
  } catch (error) {
    logger.warn(error.message)
    logger.error(error)
    return translated
  }
}

/**
 * Translates a phrase while preserving variables
 *
 * @param phrase The untranslated phrase
 * @param locale The target locale
 */
const translatePhrase = async (
  phrase: string,
  locale: string
): Promise<string> =>
  formatVars(
    phrase,
    (
      await Promise.all<string>(
        phrase.split('|').map(
          async (part: string): Promise<string> => {
            try {
              const translation = await translator.translate(part, locale)
              if (!translation) return phrase
              return cleanCharacters(translation)
            } catch (error) {
              logger.warn(error.message)
              logger.error(error)
              return phrase
            }
          }
        )
      )
    ).join(' | ')
  )

/**
 * Translates a source locale map to a target locale
 *
 * @param map The source locale map
 * @param locale The target locale
 */
const translateLocaleMap = async (
  map: LocaleMap,
  locale: string
): Promise<LocaleMap> => {
  const translations: Translation[] = []
  for (const key in map) {
    const value = map[key]
    if (typeof value !== 'string') {
      translations.push({
        key,
        promise: translateLocaleMap(value, locale),
      })
    } else {
      translations.push({
        key,
        promise: translatePhrase(value, locale),
      })
    }
  }
  const results = await Promise.all(
    translations.map(async t => await t.promise)
  )
  return results.reduce(
    (acc: LocaleMap, result, i) =>
      Object.assign(acc, { [translations[i].key]: result }),
    {}
  )
}

/**
 * @param params The parameters object
 * @param params.key Your Google API Key
 * @param params.source The source locale map
 * @param params.locales A list of locale codes
 * @param options An options object
 * @param options.verbose Specify the verbosity of the logger
 */
export default async (
  { key, locales, source }: Arguments,
  { verbose = false }: Options = {}
): Promise<LocaleMap> => {
  try {
    logger.setVerbosity(verbose)
    translator.init(key)
    const results = await Promise.all(
      locales.map(async locale => await translateLocaleMap(source, locale))
    )
    return results.reduce(
      (acc, result, i) => Object.assign(acc, { [locales[i]]: result }),
      {}
    )
  } catch (error) {
    logger.warn(error.message)
    logger.error(error)
    throw error
  }
}
