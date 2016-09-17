var from = require('from2')
var writer = require('to2')
var duplexify = require('duplexify')
var chalk = require('chalk')
var NanoTimer = require('nanotimer')
var TTY = require('crtrdg-tty')

module.exports = function () {
  var timer = new NanoTimer()
  var readableStream = from.obj(function () {})
  var tty = TTY()
  var keymap = ['<left>', '<right>', '<up>', '<down>']
  var translationMap = [[-1, 1, 0, 0], [0, 0, 1, -1]]
  var friction = 0.1
  var started = false
  var results = {
    velocityForward: 0,
    velocityLateral: 0,
    response: false
  }

  return {
    create: function () {
      var writableStream = writer.obj(function(data, enc, callback) {
        if (data.reward) {
          console.log('Reward: ' + chalk.bgGreen('  '))
        } else {
          console.log('Reward: ' + chalk.bgBlack('  '))        
        }
        console.log('Trial number: ' + data.trial)
        console.log('Left wall distance: ' + data.wallLeft + ' mm')
        console.log('Right wall distance: ' + data.wallRight + ' mm')
        console.log('Forward wall distance: ' + data.wallForward + ' mm')

        callback()
      })
      return duplexify.obj(writableStream, readableStream)
    },
    start: function () {
      if (!started) {
        timer.setInterval(function () {
          keymap.forEach(function (key, i) {
            if (tty.keysDown[key]) {
              results.velocityLateral += 4/10*translationMap[0][i]
              results.velocityForward += 4/10*translationMap[1][i]
            }
          })
          results.velocityLateral *= friction
          results.velocityForward *= friction
          if (tty.keysDown['R']) results.response = true
          else results.response = false
          readableStream.push(results)
        }, '', '2m')
        started = true
      }
    },
    stop: function () {
      timer.clearInterval()
      started = false
    }
  }
}