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

var _fs = _interopRequireDefault(require("fs"));

var _restify = _interopRequireDefault(require("restify"));

var _nodeRestifyValidation = _interopRequireDefault(require("node-restify-validation"));

var _restifyErrors = _interopRequireDefault(require("restify-errors"));

var _commander = _interopRequireDefault(require("commander"));

var _morgan = _interopRequireDefault(require("morgan"));

var _package = require("../package.json");

var _render = require("./render");

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
  }
};

var renderImage = function renderImage(params, response, next, tilePath) {
  var width, height, _params$token, token, _params$padding, padding, _params$bearing, bearing, _params$pitch, pitch, style, _params$zoom, zoom, _params$center, center, _params$bounds, bounds, _params$ratio, ratio, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, b, _bounds, _bounds2, west, south, east, north;

  return _regenerator["default"].async(function renderImage$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          width = params.width, height = params.height, _params$token = params.token, token = _params$token === void 0 ? null : _params$token, _params$padding = params.padding, padding = _params$padding === void 0 ? 0 : _params$padding, _params$bearing = params.bearing, bearing = _params$bearing === void 0 ? null : _params$bearing, _params$pitch = params.pitch, pitch = _params$pitch === void 0 ? null : _params$pitch;
          style = params.style, _params$zoom = params.zoom, zoom = _params$zoom === void 0 ? null : _params$zoom, _params$center = params.center, center = _params$center === void 0 ? null : _params$center, _params$bounds = params.bounds, bounds = _params$bounds === void 0 ? null : _params$bounds, _params$ratio = params.ratio, ratio = _params$ratio === void 0 ? 1 : _params$ratio;

          if (!(typeof style === 'string')) {
            _context.next = 22;
            break;
          }

          _context.prev = 3;

          if (!style.includes('https://')) {
            _context.next = 15;
            break;
          }

          console.log('External style');
          _context.t0 = _regenerator["default"];
          _context.next = 9;
          return _regenerator["default"].awrap(fetch(style));

        case 9:
          _context.t1 = _context.sent.json();
          _context.next = 12;
          return _context.t0.awrap.call(_context.t0, _context.t1);

        case 12:
          style = _context.sent;
          _context.next = 16;
          break;

        case 15:
          style = JSON.parse(style);

        case 16:
          _context.next = 22;
          break;

        case 18:
          _context.prev = 18;
          _context.t2 = _context["catch"](3);
          console.error('Error parsing JSON style in request: %j', _context.t2);
          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError({
            cause: _context.t2
          }, 'Error parsing JSON style')));

        case 22:
          if (!(center !== null)) {
            _context.next = 30;
            break;
          }

          if (typeof center === 'string') {
            center = parseListToFloat(center);
          }

          if (!(center.length !== 2)) {
            _context.next = 26;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Center must be longitude,latitude.  Invalid value found: ".concat((0, _toConsumableArray2["default"])(center)))));

        case 26:
          if (!(!Number.isFinite(center[0]) || Math.abs(center[0]) > 180)) {
            _context.next = 28;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Center longitude is outside world bounds (-180 to 180 deg): ".concat(center[0]))));

        case 28:
          if (!(!Number.isFinite(center[1]) || Math.abs(center[1]) > 90)) {
            _context.next = 30;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Center latitude is outside world bounds (-90 to 90 deg): ".concat(center[1]))));

        case 30:
          if (!(zoom !== null)) {
            _context.next = 34;
            break;
          }

          zoom = parseFloat(zoom);

          if (!(zoom < 0 || zoom > 22)) {
            _context.next = 34;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Zoom level is outside supported range (0-22): ".concat(zoom))));

        case 34:
          if (!(ratio !== null)) {
            _context.next = 38;
            break;
          }

          ratio = parseInt(ratio, 10);

          if (!(!ratio || ratio < 1)) {
            _context.next = 38;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Ratio is outside supported range (>=1): ".concat(ratio))));

        case 38:
          if (!(bounds !== null)) {
            _context.next = 78;
            break;
          }

          if (typeof bounds === 'string') {
            bounds = parseListToFloat(bounds);
          }

          if (!(bounds.length !== 4)) {
            _context.next = 42;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds must be west,south,east,north.  Invalid value found: ".concat((0, _toConsumableArray2["default"])(bounds)))));

        case 42:
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 45;
          _iterator = bounds[Symbol.iterator]();

        case 47:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 54;
            break;
          }

          b = _step.value;

          if (Number.isFinite(b)) {
            _context.next = 51;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds must be west,south,east,north.  Invalid value found: ".concat((0, _toConsumableArray2["default"])(bounds)))));

        case 51:
          _iteratorNormalCompletion = true;
          _context.next = 47;
          break;

        case 54:
          _context.next = 60;
          break;

        case 56:
          _context.prev = 56;
          _context.t3 = _context["catch"](45);
          _didIteratorError = true;
          _iteratorError = _context.t3;

        case 60:
          _context.prev = 60;
          _context.prev = 61;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 63:
          _context.prev = 63;

          if (!_didIteratorError) {
            _context.next = 66;
            break;
          }

          throw _iteratorError;

        case 66:
          return _context.finish(63);

        case 67:
          return _context.finish(60);

        case 68:
          _bounds = bounds, _bounds2 = (0, _slicedToArray2["default"])(_bounds, 4), west = _bounds2[0], south = _bounds2[1], east = _bounds2[2], north = _bounds2[3];

          if (!(west === east)) {
            _context.next = 71;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds west and east coordinate are the same value")));

        case 71:
          if (!(south === north)) {
            _context.next = 73;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bounds south and north coordinate are the same value")));

        case 73:
          if (!padding) {
            _context.next = 78;
            break;
          }

          if (!(Math.abs(padding) >= width / 2)) {
            _context.next = 76;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError('Padding must be less than width / 2')));

        case 76:
          if (!(Math.abs(padding) >= height / 2)) {
            _context.next = 78;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError('Padding must be less than height / 2')));

        case 78:
          if (!(bearing !== null)) {
            _context.next = 81;
            break;
          }

          if (!(bearing < 0 || bearing > 360)) {
            _context.next = 81;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Bearing is outside supported range (0-360): ".concat(bearing))));

        case 81:
          if (!(pitch !== null)) {
            _context.next = 84;
            break;
          }

          if (!(pitch < 0 || pitch > 60)) {
            _context.next = 84;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError("Pitch is outside supported range (0-60): ".concat(pitch))));

        case 84:
          if (center && zoom !== null || bounds) {
            _context.next = 86;
            break;
          }

          return _context.abrupt("return", next(new _restifyErrors["default"].BadRequestError('Either center and zoom OR bounds must be provided')));

        case 86:
          _context.prev = 86;
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
          _context.next = 96;
          break;

        case 90:
          _context.prev = 90;
          _context.t4 = _context["catch"](86);

          if (!(_context.t4 instanceof _restifyErrors["default"].InternalServerError)) {
            _context.next = 94;
            break;
          }

          return _context.abrupt("return", next(_context.t4));

        case 94:
          console.error('Error processing render request', _context.t4);
          return _context.abrupt("return", next(new _restifyErrors["default"].InternalServerError({
            cause: _context.t4
          }, 'Error processing render request')));

        case 96:
          return _context.abrupt("return", null);

        case 97:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 18], [45, 56, 60, 68], [61,, 63, 67], [86, 90]]);
}; // Provide the CLI


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
  Object.values(server.router.getRoutes()).forEach(function (_ref) {
    var _ref$spec = _ref.spec,
        url = _ref$spec.url,
        method = _ref$spec.method;

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