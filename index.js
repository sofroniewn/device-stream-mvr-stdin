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
  var velocityForward = 0
  var velocityLateral = 0
  var friction = 0.1
  var response = false
  var started = false

  return {
    createStream: function () {
      var writableStream = writer.obj(function(data, enc, callback) {
        if (data.reward) {
          console.log('Reward: ' + chalk.bgGreen('  '))
        } else {
          console.log('Reward: ' + chalk.bgBlack('  '))        
        }
        console.log('Trial number: ' + data.trialNumber)
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
              velocityLateral += 4/10*translationMap[0][i]
              velocityForward += 4/10*translationMap[1][i]
            }
          })
          velocityLateral *= friction
          velocityForward *= friction
          if (tty.keysDown['R']) response = true
          else response = false
          readableStream.push({
            velocityForward: velocityForward,
            velocityLateral: velocityLateral,
            response: response
          })
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