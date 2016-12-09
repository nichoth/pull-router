var S = require('pull-stream')
var Router = require('../')
var Source = require('../source')
var Subscribe = require('../subscribe')

// through streams go here
var MyRouter = Router([
    ['/foo', function (params, rt) {
        return S.map(function (ev) {
            return { count: ev }
        })
    }]
])

// duplex streams go here
var router = MyRouter([
    ['/foo', function (params, rt) {
        return {
            source: S.values([1,2,3]),
            sink: S.drain(function onData (ev) {
                console.log('********data', ev)
            }, function onEnd (err) {
                console.log('veiw-end', err)
            })
        }
    }]
])

var source = Source()
source.push('/foo')
S(
    source,
    router,
    Subscribe(),
    S.drain(function onRoute (streams) {
        var view = streams[0]
        var ctrl = streams[1]
        S(view, ctrl, view)
    }, function onEnd (err) {
        console.log('end', err)
    })
)



// S(
//     router(),
//     S.drain(function onRoute (rt) {
//     }, function onEnd (err) {
//     })
// )

// S(
//     router.source,
//     router.match,
//     router.subscribe,
//     S.drain(function onRoute (rt) {
//     }, function onEnd (err) {
//     })
// )
