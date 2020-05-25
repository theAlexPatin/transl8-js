#!/usr/bin/env node
const fs = require('fs')
const transl8 = require('./lib')

const loadLocale = (file) => {
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'))
  else if (file.endsWith('.js')) return require(file)
  throw new Error('Unsupported input file format')
}

const writeResults = (outdir, results) => {
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir)
  outdir = outdir.endsWith('/') ? outdir : `${outdir}/`

  Object.entries(results).forEach(([locale, result]) =>
    fs.writeFileSync(`${outdir}${locale}.json`, JSON.stringify(result, null, 2))
  )
}

const args = require('yargs')
  .options({
    key: {
      alias: 'k',
      describe: 'Google Cloud API Key',
      demandOption: true,
      type: 'string',
    },
    infile: {
      alias: 'in',
      describe: 'Source locale file (.js or .json)',
      demandOption: true,
      type: 'string',
    },
    outdir: {
      alias: 'o',
      describe: 'Output directory',
      default: 'output',
      type: 'string',
    },
    locales: {
      alias: 'l',
      describe: 'List of target locales ',
      type: 'array',
      demandOption: true,
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
  source: loadLocale(args.infile),
  locales: args.locales,
}).then((results) => {
  writeResults(args.outdir, results)
})
