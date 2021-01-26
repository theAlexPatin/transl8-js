export default class Logger {
  _verbosity = 2

  setVerbosity(verbosity: number | boolean): void {
    if (typeof verbosity === 'boolean') this._verbosity = verbosity ? 1 : 3
    else this._verbosity = verbosity
  }

  error(...args: unknown[]): void {
    if (this._verbosity < 3) return
    // eslint-disable-next-line no-console
    console.log('[Error]', ...args)
  }

  info(...args: unknown[]): void {
    if (this._verbosity < 2) return
    // eslint-disable-next-line no-console
    console.log('[Info]', ...args)
  }

  warn(...args: unknown[]): void {
    if (this._verbosity < 1) return
    // eslint-disable-next-line no-console
    console.warn('[Warning]', ...args)
  }
}
