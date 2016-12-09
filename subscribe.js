var S = require('pull-stream/pull')
var scan = require('pull-scan')
var map = require('pull-stream/throughs/map')

function Subscribe () {
    return S(
        scan(function unsubscribe (prev, next) {
            if (prev) prev[0].sink.abort()
            return next
        }, null),
        map(function subscribe (rts) {
            var view = rts[0]
            var transform = S.apply(null, rts.slice(1, rts.length))
            if (transform) S( view, transform, view )
            else S(view, view)
            return view.view
        })
    )
}

module.exports = Subscribe
