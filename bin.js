#!/usr/bin/env node
const yargs = require('yargs')

const fs = require('fs')
const path = require('path')

const transl8 = require('./lib')

const loadLocale = file => {
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'))
  else if (file.endsWith('.js')) return require(file)
  throw new Error('Unsupported input file format')
}

const writeResults = (outdir, results) => {
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
      type: 'counter',
    },
  })
  .help('h')
  .alias('h', 'help').argv

transl8({
  key: args.key,
  locales: args.locales,
  source: loadLocale(path.resolve(process.cwd(), args.infile)),
}).then(results => {
  writeResults(path.resolve(process.cwd(), args.outdir), results)
})
