const log = require('npmlog')
const pacote = require('pacote')
const { promisify } = require('util')
const openUrl = promisify(require('./utils/open-url.js'))
const usageUtil = require('./utils/usage.js')
const npm = require('./npm.js')
const hostedGitInfo = require('hosted-git-info')
const { URL } = require('url')

const usage = usageUtil('repo', 'npm repo [<pkgname> ...]')
const completion = cb => cb(null, [])

const cmd = (args, cb) => repo(args).then(() => cb()).catch(cb)

const repo = async args => {
  if (!args || !args.length) {
    args = ['.']
  }
  await Promise.all(args.map(pkg => getRepo(pkg)))
}

const getRepo = async pkg => {
  const opts = { ...npm.flatOptions, fullMetadata: true }
  const mani = await pacote.manifest(pkg, opts)

  const r = mani.repository
  if (!r || typeof r.url !== 'string') {
    throw Object.assign(new Error('no repository'), {
      pkgid: pkg
    })
  }
  const info = hostedGitInfo.fromUrl(r.url)
  const url = info ? info.browse() : unknownHostedUrl(r.url)

  if (!url) {
    throw Object.assign(new Error('no repository: could not get url'), {
      pkgid: pkg
    })
  }

  log.silly('docs', 'url', url)
  await openUrl(url, 'docs available at the following URL')
}

const unknownHostedUrl = url => {
  try {
    const {
      protocol,
      hostname,
      pathname
    } = new URL(url)

    if (!protocol || !hostname) {
      return null
    }

    const proto = /(git\+)http:$/.test(protocol) ? 'http:' : 'https:'
    const path = pathname.replace(/\.git$/, '')
    return `${proto}//${hostname}${path}`
  } catch (e) {
    return null
  }
}

module.exports = Object.assign(cmd, { usage, completion })
