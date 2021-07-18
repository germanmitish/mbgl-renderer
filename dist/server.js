#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.server = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _restify = _interopRequireDefault(require("restify"));

var _nodeRestifyValidation = _interopRequireDefault(require("node-restify-validation"));

var _restifyErrors = _interopRequireDefault(require("restify-errors"));

var _commander = _interopRequireDefault(require("commander"));

var _morgan = _interopRequireDefault(require("morgan"));

var _package = require("../package.json");

var _render = require("./render");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var fetch = require('node-fetch');

_morgan["default"].token('url', function (req) {
  return req.path();
});

var parseListToFloat = function parseListToFloat(text) {
  return text.split(',').map(Number);
};

var raiseError = function raiseError(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
};

var PARAMS = {
  style: {
    isRequired: true,
    isString: true
  },
  width: {
    isRequired: true,
    isInt: true
  },
  height: {
    isRequired: true,
    isInt: true
  },
  padding: {
    isRequired: false,
    isInt: true
  },
  zoom: {
    isRequired: false,
    isDecimal: true
  },
  ratio: {
    isRequired: false,
    isDecimal: true
  },
  bearing: {
    isRequired: false,
    isDecimal: true
  },
  pitch: {
    isRequired: false,
    isDecimal: true
  },
  token: {
    isRequired: false,
    isString: true
  },
  parcel: {
    isRequired: false,
    isInt: true
  }
};

var renderImage = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(params, response, next, tilePath) {
    var width, height, _params$token, token, _params$padding, padding, _params$bearing, bearing, _params$pitch, pitch, _params$parcel, parcel, style, _params$zoom, zoom, _params$center, center, _params$bounds, bounds, _params$ratio, ratio, _style$layers, parcelArray, dimInd, rdInd, _style$layers2, _dimInd, _rdInd, _iterator, _step, b, _bounds, _bounds2, west, south, east, north;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            width = params.width, height = params.height, _params$token = params.token, token = _params$token === void 0 ? null : _params$token, _params$padding = params.padding, padding = _params$padding === void 0 ? 0 : _params$padding, _params$bearing = params.bearing, bearing = _params$bearing === void 0 ? null : _params$bearing, _params$pitch = params.pitch, pitch = _params$pitch === void 0 ? null : _params$pitch, _params$parcel = params.parcel, parcel = _params$parcel === void 0 ? null : _params$parcel;
            style = params.style, _params$zoom = params.zoom, zoom = _params$zoom === void 0 ? null : _params$zoom, _params$center = params.center, center = _params$center === void 0 ? null : _params$center, _params$bounds = params.bounds, bounds = _params$bounds === void 0 ? null : _params$bounds, _params$ratio = params.ratio, ratio = _params$ratio === void 0 ? 1 : _params$ratio;

            if (!(typeof style === 'string')) {
              _context.next = 21;
              break;
            }

            _context.prev = 3;

            if (!style.includes('https://')) {
              _context.next = 14;
              break;
            }

            console.log('External style');
            _context.next = 8;
            return fetch(style);

          case 8:
            _context.next = 10;
            return _context.sent.json();

          case 10:
            style = _context.sent;

            if (parcel) {
              if (Array.isArray(parcel)) {
                console.log('Highlight parcels', parcel);
                parcelArray = parcel.map(function (v) {
                  return Number(v);
                });
                dimInd = style.layers.findIndex(function (l) {
                  return l.id === "dimensions";
                });
                rdInd = style.layers.findIndex(function (l) {
                  return l.id === "road-label";
                });
                style.layers[dimInd].filter = ["match", ["get", "parcel_objectid"], parcelArray, true, false];
                style.layers.splice(rdInd, 0, {
                  'id': "parcel-line",
                  'source': "tiles",
                  'source-layer': "parcels",
                  'type': "line",
                  'minzoom': 13,
                  'maxzoom': 22,
                  'paint': {
                    "line-color": "white",
                    "line-opacity": 1,
                    "line-width": 4
                  },
                  'filter': ["match", ["id"], parcelArray, true, false]
                });
                style.layers.splice(dimInd, 0, {
                  'id': "parcel",
                  'source': "tiles",
                  'source-layer': "parcels",
                  'type': "fill",
                  'paint': {
                    "fill-opacity": 0.4,
                    "fill-color": "white"
                  },
                  'filter': ["match", ["id"], parcelArray, true, false]
                });

                (_style$layers = style.layers).push.apply(_style$layers, [{
                  'id': "parcel-label",
                  'source': "tiles",
                  'source-layer': "parcels-centroids",
                  'type': "symbol",
                  'paint': {
                    "text-color": "black",
                    "text-opacity": 0.7,
                    "text-halo-width": 1,
                    "text-halo-color": "white"
                  },
                  'layout': {
                    "text-field": ["get", "parcel_no"],
                    "text-anchor": "bottom",
                    "text-font": ["Montserrat SemiBold"],
                    "text-size": 16,
                    "text-padding": 12
                  },
                  'filter': ["match", ["id"], parcelArray, true, false]
                }]);
              } else {
                console.log('Highlight one parcel', parcel);
                _dimInd = style.layers.findIndex(function (l) {
                  return l.id === "dimensions";
                });
                _rdInd = style.layers.findIndex(function (l) {
                  return l.id === "road-label";
                });
                style.layers[_dimInd].filter = ["==", ["get", "parcel_objectid"], Number(parcel)];
                style.layers.splice(_rdInd, 0, {
                  'id': "parcel-line",
                  'source': "tiles",
                  'source-layer': "parcels",
                  'type': "line",
                  'minzoom': 13,
                  'maxzoom': 22,
                  'paint': {
                    "line-color": "white",
                    "line-opacity": 1,
                    "line-width": 4
                  },
                  'filter': ["match", ["id"], Number(parcel), true, false]
                });
                style.layers.splice(_dimInd, 0, {
                  'id': "parcel",
                  'source': "tiles",
                  'source-layer': "parcels",
                  'type': "fill",
                  'paint': {
                    "fill-opacity": 0.4,
                    "fill-color": "white"
                  },
                  'filter': ["match", ["id"], Number(parcel), true, false]
                });

                (_style$layers2 = style.layers).push.apply(_style$layers2, [{
                  'id': "parcel-label",
                  'source': "tiles",
                  'source-layer': "parcels-centroids",
                  'type': "symbol",
                  'paint': {
                    "text-color": "black",
                    "text-opacity": 0.7,
                    "text-halo-width": 1,
                    "text-halo-color": "white"
                  },
                  'layout': {
                    "text-field": ["get", "parcel_no"],
                    "text-anchor": "bottom",
                    "text-font": ["Montserrat SemiBold"],
                    "text-size": 16,
                    "text-padding": 12
                  },
                  'filter': ["match", ["id"], Number(parcel), true, false]
                }]);
              }
            }

            _context.next = 15;
            break;

          case 14:
            style = JSON.parse(style);

          case 15:
            _context.next = 21;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](3);
            console.error('Error parsing JSON style in request: %j', _context.t0);
            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError({
              cause: _context.t0
            }, 'Error parsing JSON style')));

          case 21:
            if (!(center !== null)) {
              _context.next = 29;
              break;
            }

            if (typeof center === 'string') {
              center = parseListToFloat(center);
            }

            if (!(center.length !== 2)) {
              _context.next = 25;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Center must be longitude,latitude.  Invalid value found: ".concat((0, _toConsumableArray2["default"])(center)))));

          case 25:
            if (!(!Number.isFinite(center[0]) || Math.abs(center[0]) > 180)) {
              _context.next = 27;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Center longitude is outside world bounds (-180 to 180 deg): ".concat(center[0]))));

          case 27:
            if (!(!Number.isFinite(center[1]) || Math.abs(center[1]) > 90)) {
              _context.next = 29;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Center latitude is outside world bounds (-90 to 90 deg): ".concat(center[1]))));

          case 29:
            if (!(zoom !== null)) {
              _context.next = 33;
              break;
            }

            zoom = parseFloat(zoom);

            if (!(zoom < 0 || zoom > 22)) {
              _context.next = 33;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Zoom level is outside supported range (0-22): ".concat(zoom))));

          case 33:
            if (!(ratio !== null)) {
              _context.next = 37;
              break;
            }

            ratio = parseInt(ratio, 10);

            if (!(!ratio || ratio < 1)) {
              _context.next = 37;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Ratio is outside supported range (>=1): ".concat(ratio))));

          case 37:
            if (!(bounds !== null)) {
              _context.next = 68;
              break;
            }

            if (typeof bounds === 'string') {
              bounds = parseListToFloat(bounds);
            }

            if (!(bounds.length !== 4)) {
              _context.next = 41;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds must be west,south,east,north.  Invalid value found: ".concat((0, _toConsumableArray2["default"])(bounds)))));

          case 41:
            _iterator = _createForOfIteratorHelper(bounds);
            _context.prev = 42;

            _iterator.s();

          case 44:
            if ((_step = _iterator.n()).done) {
              _context.next = 50;
              break;
            }

            b = _step.value;

            if (Number.isFinite(b)) {
              _context.next = 48;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds must be west,south,east,north.  Invalid value found: ".concat((0, _toConsumableArray2["default"])(bounds)))));

          case 48:
            _context.next = 44;
            break;

          case 50:
            _context.next = 55;
            break;

          case 52:
            _context.prev = 52;
            _context.t1 = _context["catch"](42);

            _iterator.e(_context.t1);

          case 55:
            _context.prev = 55;

            _iterator.f();

            return _context.finish(55);

          case 58:
            _bounds = bounds, _bounds2 = (0, _slicedToArray2["default"])(_bounds, 4), west = _bounds2[0], south = _bounds2[1], east = _bounds2[2], north = _bounds2[3];

            if (!(west === east)) {
              _context.next = 61;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds west and east coordinate are the same value")));

          case 61:
            if (!(south === north)) {
              _context.next = 63;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds south and north coordinate are the same value")));

          case 63:
            if (!padding) {
              _context.next = 68;
              break;
            }

            if (!(Math.abs(padding) >= width / 2)) {
              _context.next = 66;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError('Padding must be less than width / 2')));

          case 66:
            if (!(Math.abs(padding) >= height / 2)) {
              _context.next = 68;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError('Padding must be less than height / 2')));

          case 68:
            if (!(bearing !== null)) {
              _context.next = 71;
              break;
            }

            if (!(bearing < 0 || bearing > 360)) {
              _context.next = 71;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bearing is outside supported range (0-360): ".concat(bearing))));

          case 71:
            if (!(pitch !== null)) {
              _context.next = 74;
              break;
            }

            if (!(pitch < 0 || pitch > 60)) {
              _context.next = 74;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Pitch is outside supported range (0-60): ".concat(pitch))));

          case 74:
            if (center && zoom !== null || bounds) {
              _context.next = 76;
              break;
            }

            return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError('Either center and zoom OR bounds must be provided')));

          case 76:
            _context.prev = 76;
            (0, _render.render)(style, parseInt(width, 10), parseInt(height, 10), {
              zoom: zoom,
              center: center,
              bounds: bounds,
              padding: padding,
              tilePath: tilePath,
              ratio: ratio,
              bearing: bearing,
              pitch: pitch,
              token: token
            }).then(function (data, rejected) {
              if (rejected) {
                console.error('render request rejected', rejected);
                return next(new _restifyErrors["default"].InternalServerError({
                  cause: rejected
                }, 'Error processing render request'));
              }

              return response.sendRaw(200, data, {
                'content-type': 'image/png'
              });
            })["catch"](function (err) {
              if (err instanceof _restifyErrors["default"].InternalServerError) {
                return next(err);
              }

              console.error('Error processing render request', err);
              return next(new _restifyErrors["default"].InternalServerError({
                cause: err
              }, 'Error processing render request'));
            });
            _context.next = 86;
            break;

          case 80:
            _context.prev = 80;
            _context.t2 = _context["catch"](76);

            if (!(_context.t2 instanceof _restifyErrors["default"].InternalServerError)) {
              _context.next = 84;
              break;
            }

            return _context.abrupt("return", next(_context.t2));

          case 84:
            console.error('Error processing render request', _context.t2);
            return _context.abrupt("return", next(new _restifyErrors["default"].InternalServerError({
              cause: _context.t2
            }, 'Error processing render request')));

          case 86:
            return _context.abrupt("return", null);

          case 87:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 17], [42, 52, 55, 58], [76, 80]]);
  }));

  return function renderImage(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}(); // Provide the CLI


_commander["default"].version(_package.version).description('Start a server to render Mapbox GL map requests to images.').option('-p, --port <n>', 'Server port', parseInt).option('-t, --tiles <mbtiles_path>', 'Directory containing local mbtiles files to render').option('-v, --verbose', 'Enable request logging').parse(process.argv);

var _cli$port = _commander["default"].port,
    port = _cli$port === void 0 ? 8000 : _cli$port,
    _cli$tiles = _commander["default"].tiles,
    tilePath = _cli$tiles === void 0 ? null : _cli$tiles,
    _cli$verbose = _commander["default"].verbose,
    verbose = _cli$verbose === void 0 ? false : _cli$verbose;

var server = _restify["default"].createServer({
  ignoreTrailingSlash: true
});

exports.server = server;
server.use(_restify["default"].plugins.queryParser());
server.use(_restify["default"].plugins.bodyParser());
server.use(_nodeRestifyValidation["default"].validationPlugin({
  errorsAsArray: false,
  forbidUndefinedVariables: false,
  errorHandler: _restifyErrors["default"].BadRequestError
}));

if (verbose) {
  server.use((0, _morgan["default"])('dev', {
    // only log valid endpoints
    // specifically ignore health check endpoint
    skip: function skip(req, res) {
      return req.statusCode === 404 || req.path() === "/health";
    }
  }));
}
/**
 * /render (GET): renders an image based on request query parameters.
 */


server.get({
  url: '/render',
  validation: {
    queries: PARAMS
  }
}, function (req, res, next) {
  return renderImage(req.query, res, next, tilePath);
});
/**
 * /render (POST): renders an image based on request body.
 */

server.post({
  url: '/render',
  validation: {
    content: PARAMS
  }
}, function (req, res, next) {
  return renderImage(req.body, res, next, tilePath);
});
/**
 * List all available endpoints.
 */

server.get({
  url: '/'
}, function (req, res) {
  var routes = {};
  Object.values(server.router.getRoutes()).forEach(function (_ref2) {
    var _ref2$spec = _ref2.spec,
        url = _ref2$spec.url,
        method = _ref2$spec.method;

    if (!routes[url]) {
      routes[url] = [];
    }

    routes[url].push(method);
  });
  res.send({
    routes: routes,
    version: _package.version
  });
});
/**
 * /health: returns 200 to confirm that server is up
 */

server.get({
  url: '/health'
}, function (req, res, next) {
  res.send(200);
  next();
});

if (tilePath !== null) {
  if (!_fs["default"].existsSync(tilePath)) {
    raiseError("Path to mbtiles files does not exist: ".concat(tilePath));
  }

  console.log('Using local mbtiles in: %j', tilePath);
}

server.listen(port, function () {
  console.log('Mapbox GL static rendering server started and listening at %s', server.url);
});
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
process.on('beforeExit', function (code) {
  // Can make asynchronous calls
  setTimeout(function () {
    console.log("Process will exit with code: ".concat(code));
    process.exit(code);
  }, 100);
});
process.on('exit', function (code) {
  // Only synchronous calls
  console.log("Process exited with code: ".concat(code));
});
var _default = {
  server: server
};
exports["default"] = _default;