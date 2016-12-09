# pull router

High level router using pull streams.

## install

    $ npm install pull-router

## example

```js
var S = require('pull-stream')
var Router = require('pull-router')

// through streams go here
var TestRouter = Router([
    ['/foo', function () {
        return S.map(function (ev) {
            return { count: ev }
        })
    }]
])

var router = TestRouter([
    // duplex strams go here
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

// router() returns a source stream that emits views
// listen for route events (in a browser) and pipe them
// in node call router().push() -- an instance of pull-pushable
// when the route changes, this stream will pipe the new route and
// unpipe the old one
S(
    router(),
    S.drain(function onRoute (view) {
        assert.equal(view, 'test')
    })
)
```
