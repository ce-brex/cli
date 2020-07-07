const log = require('npmlog')
const pacote = require('pacote')
const { promisify } = require('util')
const openUrl = promisify(require('./utils/open-url.js'))
const usageUtil = require('./utils/usage.js')
const npm = require('./npm.js')

const usage = usageUtil('bugs', 'npm bugs [<pkgname>]')
const completion = cb => cb(null, [])

const cmd = (args, cb) => bugs(args).then(() => cb()).catch(cb)

const bugs = async args => {
  if (!args || !args.length) {
    args = ['.']
  }
  await Promise.all(args.map(pkg => getBugs(pkg)))
}

const getBugs = async pkg => {
  const opts = { ...npm.flatOptions, fullMetadata: true }
  const mani = await pacote.manifest(pkg, { fullMetadata: true })
  const url = mani.bugs && typeof mani.bugs === 'string' ? mani.bugs
    : mani.bugs && typeof mani.bugs === 'object' ? mani.bugs.url
    : `https://www.npmjs.org/package/${mani.name}`
  log.silly('bugs', 'url', url)
  await openUrl(url, 'bug list available at the following URL')
}

module.exports = Object.assign(cmd, { usage, completion })
