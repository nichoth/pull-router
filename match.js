var map = require('pull-stream/throughs/map')
var Routes = require('routes')

function Match (ctrlRoutes, viewRoutes) {
    var ctrlRouter = Routes()
    ctrlRoutes.forEach(function (rt) {
        ctrlRouter.addRoute(rt[0], rt[1])
    })

    var viewRouter = Routes()
    viewRoutes.forEach(function (rt) {
        viewRouter.addRoute(rt[0], rt[1])
    })

    return map(function (path) {
        var viewMatch = viewRouter.match(path)
        var ctrlMatch = ctrlRouter.match(path)
        var viewStream = viewMatch.fn(viewMatch.params, viewMatch)
        var ctrlStream = ctrlMatch.fn(ctrlMatch.params, ctrlMatch)
        return [viewStream, ctrlStream]
    })
}

module.exports = Match
