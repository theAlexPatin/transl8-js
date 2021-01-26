export interface LocaleMap {
  [key: string]: LocaleMap | string
}

export interface Arguments {
  key: string
  source: LocaleMap
  locales: string[]
}

export interface Options {
  verbose?: boolean | number
}
