const log = require('npmlog')
const pacote = require('pacote')
const { promisify } = require('util')
const openUrl = promisify(require('./utils/open-url.js'))
const usageUtil = require('./utils/usage.js')
const npm = require('./npm.js')

const usage = usageUtil('docs', 'npm docs [<pkgname> ...]')
const completion = cb => cb(null, [])

const cmd = (args, cb) => docs(args).then(() => cb()).catch(cb)

const docs = async args => {
  if (!args || !args.length) {
    args = ['.']
  }
  await Promise.all(args.map(pkg => getDocs(pkg)))
}

const getDocs = async pkg => {
  const opts = { ...npm.flatOptions, fullMetadata: true }
  const mani = await pacote.manifest(pkg, opts)
  const url = mani.homepage || 'https://www.npmjs.org/package/' + mani.name
  log.silly('docs', 'url', url)
  await openUrl(url, 'docs available at the following URL')
}

module.exports = Object.assign(cmd, { usage, completion })
