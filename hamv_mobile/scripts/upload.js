/*
 * use "nc" to prevent build code process
 * use "na" to prevent build android process, and not upload android
 * use "ni" to prevent build iOS process, and not upload iOS
 * use "ua" to prevent foce upload android
 * use "ui" to prevent foce upload iOS
 * use "beta" to upload to beta project
 */
const fs = require('fs')
const { spawn } = require('child_process')

const args = process.argv.slice(2).reduce(
  (acc, val)  => {
    acc[val] = true
    return acc
  },
  {}
)

const hockeyApp = parseSecretFile('.secret.json')
if (!hockeyApp) return

buildCode()
  .then(buildAndroid)
  .then(() => uploadAndroid(hockeyApp.apiToken, hockeyApp.appId.android))
  .then(buildIos)
  .then(() => uploadIos(hockeyApp.apiToken, hockeyApp.appId.ios))

function buildAndroid() {
  if (args.na) return Promise.resolve()
  return run('cordova build android')
}

function buildCode() {
  if (args.nc) return Promise.resolve()
  return run('npm run build --prod')
}

function buildIos() {
  if (args.ni) return Promise.resolve()
  return run('cordova build ios --device')
}

function loading() {
  const arr = ['\\', '|', '/', '-']
  let i = 0
  return setInterval(
    () => {
      process.stdout.write('\r' + arr[i++])
      i &= 3
    },
    50
  )
}

function parseSecretFile(path) {
  if (!fs.existsSync(path)) {
    console.log('\x1b[1m%s\x1b[0m', `ERR: ${path} not found`)
    console.log(`please create ${path} like this:`)
    console.log(
      JSON.stringify(
        {
          hockeyApp: {
            apiToken: 'hockeyapp_api_token',
            appId: {
              android: {
                alpha: 'android_alpha_toekn',
                beta: 'android_beta_toekn',
              },
              ios: {
                alpha: 'ios_alpha_toekn',
                beta: 'ios_beta_toekn',
              },
            },
          },
        },
        null,
        2
      )
    )
    return
  }

  let secret = require('../' + path)
  if (!secret.hockeyApp.apiToken) {
    console.log('\x1b[1m%s\x1b[0m', `ERR: hockeyApp.apiToken not found`)
    return
  }
  if (!secret.hockeyApp.appId) {
    console.log('\x1b[1m%s\x1b[0m', `ERR: hockeyApp.appId not found`)
    return
  }

  return secret.hockeyApp
}

function run(str) {
  console.log('\x1b[1m%s\x1b[0m', `RUN: ${str}`)
  return new Promise(
    (resolve, reject) => {
      const cmd = str.split(' ')
      const process = spawn(cmd[0], cmd.slice(1))

      process.stdout.setEncoding('utf8')
      process.stdout.on('data', console.log)

      process.stderr.setEncoding('utf8')
      process.stderr.on('data', console.log)

      process.on('close', resolve)
    }
  )
}

function upload(params) {
  const request = require('request')
  const url = `https://rink.hockeyapp.net/api/2/apps/${params.appId}/app_versions/upload`
  let options = {
    url,
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-HockeyAppToken': params.token,
    }
  }

  let interval = loading()

  let cb = (err, req, body) => {
    clearInterval(interval)
    process.stdout.write('\r')
    console.log(body)
  }

  let form = request.post(options, cb).form()
  form.append('status', 2)
  form.append('notify', 0)
  form.append('ipa', fs.createReadStream(params.path))

}

function uploadAndroid(token, appId = {}) {
  if (args.na && !args.ua) return

  appId = args.beta ? appId.beta : appId.alpha
  if (!appId) {
    console.log('\x1b[1m%s\x1b[0m', `NOTE: hockeyApp.appId.android.${args.beta ? 'beta' : 'alpha'} not found`)
    return
  }

  const path = './platforms/android/build/outputs/apk/debug/android-debug.apk'
  if (!fs.existsSync(path)) {
    console.log('\x1b[1m%s\x1b[0m', `NOTE: ${path} not found`)
    return
  }

  console.log('\x1b[1m%s\x1b[0m', `Upload android to ${appId}`)
  return upload({
    appId,
    path,
    token,
  })
}

function uploadIos(token, appId = {}) {
  if (args.ni && !args.ui) return

  appId = args.beta ? appId.beta : appId.alpha
  if (!appId) {
    console.log('\x1b[1m%s\x1b[0m', `NOTE: hockeyApp.appId.ios.${args.beta ? 'beta' : 'alpha'} not found`)
    return
  }

  let path = './platforms/ios/build/device/'
  if (!fs.existsSync(path)){
    console.log('\x1b[1m%s\x1b[0m', `NOTE: ${path} not found`)
    return;
  }

  const ipa = fs.readdirSync(path).find(file => file.match('.ipa'))
  if (!ipa) {
    console.log('\x1b[1m%s\x1b[0m', `NOTE: ${path}/*.ipa not found`)
    return
  }
  path += ipa

  console.log('\x1b[1m%s\x1b[0m', `Upload iOS to ${appId}`)
  return upload({
    appId,
    path,
    token,
  })
}
