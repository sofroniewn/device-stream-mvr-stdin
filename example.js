var device = require('./')()

var deviceStream = device.createStream()

var initial = {
  wallDistance: {
    left: 15,
    right: 15,
    forward: 30,
  },
  trialNumber: 0,
  reward: true
}

/////////////////////////////////////////////////////////////////
var through = require('through2')

createExperimentStream = function (initial) {
  var position = {
    forward: 0,
    lateral: 0
  }
  var trialNumber = 0
  var prevTime = Date.now()
  var wallDistance = {
    left: 0,
    right: 0,
    forward: 0,
  }
  var reward = false

  return through.obj(function (data, enc, callback) {
    var curTime = Date.now()
    var deltaTime = curTime - prevTime
    prevTime = curTime
    position.forward += data.velocity.forward
    position.lateral += data.velocity.lateral

    if (position.forward > 100) position.forward = 100      
    if (position.forward < 0) position.forward = 0      
    if (position.lateral > 50) position.lateral = 50      
    if (position.lateral < -50) position.lateral = -50      

    if (position.forward > 80) {
      reward = true     
    } else {
      reward = false
    }


    wallDistance.left = 50 + position.lateral
    wallDistance.right = 50 - position.lateral
    wallDistance.forward = 100 - position.forward



    callback(null, {
      position: position,
      velocity: data.velocity,
      response: data.response,
      reward: reward,
      trialNumber: trialNumber,
      wallDistance: wallDistance,
      time: deltaTime
    })
  })
}
/////////////////////////////////////////////////////////////////

deviceStream.write(initial)
//deviceStream.on('data', console.log)

var exp = createExperimentStream()

var res = deviceStream.pipe(exp)
//res.on('data', console.log)
res.pipe(deviceStream)

device.start()
var expState = true
process.stdin.on('data', function(data) {
  if (data.toString().trim() === 'p') {
    if (expState) {
      console.log('stopping')
      device.stop()
    } else {
      console.log('starting')
      device.start()
    }
    expState = !expState
  }
})

