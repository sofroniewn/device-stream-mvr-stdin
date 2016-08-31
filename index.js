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
  var velocity = [0, 0]
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
        console.log('Left wall distance: ' + data.wallDistance.left + ' mm')
        console.log('Right wall distance: ' + data.wallDistance.right + ' mm')
        console.log('Forward wall distance: ' + data.wallDistance.forward + ' mm')

        callback()
      })
      return duplexify.obj(writableStream, readableStream)
    },
    start: function () {
      if (!started) {
        timer.setInterval(function () {
          keymap.forEach(function (key, i) {
            if (tty.keysDown[key]) {
              velocity[0] += 4*translationMap[0][i]
              velocity[1] += 4*translationMap[1][i]
            }
          })
          velocity[0] *= friction
          velocity[1] *= friction
          if (tty.keysDown['R']) response = true
          else response = false
          readableStream.push({
            velocity: {
              forward: velocity[1],
              lateral: velocity[0]
            },
            response: response
          })
        }, '', '20m')
        started = true
      }
    },
    stop: function () {
      timer.clearInterval()
      started = false
    }
  }
}