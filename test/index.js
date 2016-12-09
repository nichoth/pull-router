var S = require('pull-stream')
var Abortable = require('pull-abortable')
var Pushable = require('pull-pushable')
var test = require('tape')
var Router = require('../')

// through streams go here
var rs = [
    ['/foo', function fooController (params, rt) {
        return S.map(function (ev) {
            return { count: ev }
        })
    }],
    ['/bar', function barController (params, rt) {
        return S.map(function (ev) {
            return ev + 'bar'
        })
    }]
]

test('route matching', function (t) {
    t.plan(3)

    var TestRouter = Router(rs)
    // duplex streams go here
    var router = TestRouter([
        ['/foo', function fooView (params, rt) {
            return {
                source: S.values([1,2,3]),
                sink: S.collect(function (err, res) {
                    t.error(err)
                    var expected = [
                        { count: 1 },
                        { count: 2 },
                        { count: 3 }
                    ]
                    t.deepEqual(res, expected, 'should match routes')
                })
            }
        }]
    ])

    var source = router.source()
    source.push('/foo')
    S(
        source,
        router.match(),
        S.drain(function onRoute (streams) {
            var view = streams[0]
            var ctrl = streams[1]
            S( view, ctrl, view )
        }, function onEnd (err) {
            t.error(err)
        })
    )
    source.end()
})


test('subscribe', function (t) {
    t.plan(7)

    var TestRouter = Router(rs)
    var router = TestRouter([
        ['/foo', function fooView (params, rt) {
            var abortable = Abortable()
            var p = Pushable(function onEnd (err) {
                t.error(err, 'should end the source')
            })

            // sink needs to have an `abort` method
            var sink = S(
                abortable,
                S.collect(function (err, res) {
                    t.error(err)
                    var expected = [
                        { count: 1 },
                        { count: 2 },
                        { count: 3 }
                    ]
                    t.deepEqual(res, expected, 'should match routes')
                })
            )
            sink.abort = abortable.abort.bind(abortable)
            p.push(1)
            p.push(2)
            p.push(3)
            return {
                source: p,
                sink: sink,
                view: 'test'
            }
        }],

        ['/bar', function barView (params, rt) {
            return {
                source: S.once('bar'),
                sink: S.collect(function (err, res) {
                    t.error(err)
                    t.deepEqual(res, ['barbar'],
                        'should subscribe the next route')
                }),
                view: 'test2'
            }
        }]
    ])

    var source = router.source()
    source.push('/foo')
    process.nextTick(function () {
        source.push('/bar')
        source.end()
    })

    S(
        source,
        router.match(),
        router.subscribe(),
        S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, [ 'test', 'test2' ],
                'should return view property')
        })
    )
})

test('everything', function (t) {
    t.plan(4)
    var TestRouter = Router(rs)
    var router = TestRouter([
        ['/foo', function () {
            return {
                source: S.once(1),
                sink: S.collect(function (err, res) {
                    t.error(err)
                    t.deepEqual(res, [{ count: 1 }], 'should pipe the route')
                }),
                view: 'test'
            }
        }]
    ])
    var routeStream = router()
    routeStream.push('/foo')
    S(
        routeStream,
        S.collect(function (err, res) {
            t.error(err)
            t.deepEqual(res, ['test'], 'should do everything at once')
        })
    )
    routeStream.end()
})
