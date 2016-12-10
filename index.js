var S = require('pull-stream/pull')
var Source = require('./source')
var Match = require('./match')
var Subscribe = require('./subscribe')

function Router (ctrlRoutes) {
    return function router (viewRoutes) {
        function RouteStream (routeEvent) {
            var source = Source(routeEvent)
            var match = Match(ctrlRoutes, viewRoutes)
            var sub = Subscribe()
            var stream = S(
                source,
                match,
                sub
            )
            stream.push = source.push.bind(source)
            stream.end = source.end.bind(source)
            return stream
        }

        RouteStream.source = Source
        RouteStream.match = function () {
            return Match(ctrlRoutes, viewRoutes)
        }
        RouteStream.subscribe = Subscribe
        return RouteStream
    }
}

module.exports = Router
