#!/usr/bin/env node
import yargs from 'yargs'

import fs from 'fs'
import path from 'path'

import transl8 from './lib'
import { LocaleMap } from './types'

const loadLocale = async (file: string): Promise<LocaleMap> => {
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'))
  if (file.endsWith('.js')) return await import(file)
  throw new Error('Unsupported input file format')
}

const writeResults = (outdir: string, results: LocaleMap): void => {
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir)
  Object.entries(results).forEach(([locale, result]) =>
    fs.writeFileSync(
      `${outdir}/${locale}.json`,
      JSON.stringify(result, null, 2)
    )
  )
}

const args = yargs
  .options({
    infile: {
      alias: 'in',
      demandOption: true,
      describe: 'Source locale file (.js or .json)',
      type: 'string',
    },
    key: {
      alias: 'k',
      demandOption: true,
      describe: 'Google Cloud API Key',
      type: 'string',
    },
    locales: {
      alias: 'l',
      demandOption: true,
      describe: 'List of target locales ',
      type: 'array',
    },
    outdir: {
      alias: 'o',
      default: 'output',
      describe: 'Output directory',
      type: 'string',
    },
    verbose: {
      alias: 'v',
      describe: '1 for warnings, 2 for info, 3 for errors',
      type: 'count',
    },
  })
  .help('h')
  .alias('h', 'help').argv

const execute = async (): Promise<void> => {
  const results = await transl8(
    {
      key: args.key,
      locales: args.locales.map(locale => String(locale)),
      source: await loadLocale(path.resolve(process.cwd(), args.infile)),
    },
    {
      verbose: args.verbose,
    }
  )

  writeResults(path.resolve(process.cwd(), args.outdir), results)
}

execute().finally(() => process.exit(1))
