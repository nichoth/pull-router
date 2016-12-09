var S = require('pull-stream')
var Router = require('../')
var assert = require('assert')

// through streams go here
var TestRouter = Router([
    ['/foo', function (params, route) {
        return S.map(function (ev) {
            return { count: ev }
        })
    }]
])

var router = TestRouter([
    // duplex streams go here
    ['/foo', function (params, route) {
        return {
            source: S.once(1),
            sink: S.collect(function (err, res) {
                // our source is piped through the transform
                // we defined above
                console.log(route.route)  // => /foo
                console.log(res[0])  // => { count: 1 }
                assert.equal(res[0].count, 1)
            }),
            // in here we would do something to connect a view
            // to the source and sink.
            view: 'test'
        }
    }]
])

// `router()` returns a source stream that emits views and
// listens for route events (in a browser).
// In node call `router().push()` -- `router()` is an instance of
// pull-pushable.
// When the route changes, this stream will pipe the new route and
// unpipe the old one
var routeStream = router()
S(
    routeStream,
    S.drain(function onRoute (view) {
        assert.equal(view, 'test')
    })
)
routeStream.push('/foo')
routeStream.end()

