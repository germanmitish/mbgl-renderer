#!/usr/bin/env node
import fs from 'fs'
import restify from 'restify'
import restifyValidation from 'node-restify-validation'
import restifyErrors from 'restify-errors'
import cli from 'commander'
import logger from 'morgan'

import { version } from '../package.json'
import { render } from './render'

const fetch = require('node-fetch')
logger.token('url', (req) => req.path())

const parseListToFloat = (text) => text.split(',').map(Number)

const raiseError = (msg) => {
    console.error('ERROR:', msg)
    process.exit(1)
}

const PARAMS = {
    style: { isRequired: true, isString: true },
    width: { isRequired: true, isInt: true },
    height: { isRequired: true, isInt: true },
    padding: { isRequired: false, isInt: true },
    zoom: { isRequired: false, isDecimal: true },
    ratio: { isRequired: false, isDecimal: true },
    bearing: { isRequired: false, isDecimal: true },
    pitch: { isRequired: false, isDecimal: true },
    token: { isRequired: false, isString: true },
    parcel: { isRequired: false, isInt: true }
}

const renderImage = async (params, response, next, tilePath) => {
    const {
        width,
        height,
        token = null,
        padding = 0,
        bearing = null,
        pitch = null,
        parcel = null,
    } = params

    let { style, zoom = null, center = null, bounds = null, ratio = 1 } = params

    if (typeof style === 'string') {
        try {
            if(style.includes('https://')){
              console.log('External style')
              style = await (await fetch(style)).json()
              if(parcel){
                if(Array.isArray(parcel)){
                  console.log('Highlight parcels', parcel)
                  const parcelArray = parcel.map(v=>Number(v))
                  const dimInd = style.layers.findIndex(l=>l.id==="dimensions")
                  const rdInd = style.layers.findIndex(l=>l.id==="road-label")

                  style.layers[dimInd].filter = ["match", ["get", "parcel_objectid"], parcelArray, true, false ]
                  
                  style.layers.splice(rdInd, 0,{
                    'id':"parcel-line",
                    'source':"tiles",
                    'source-layer':"parcels",
                    'type':"line",
                    'minzoom':13,
                    'maxzoom':22,
                    'paint':{
                      "line-color": "white",
                      "line-opacity": 1,
                      "line-width": 4,
                    },
                    'filter':[
                      "match",
                      ["id"], parcelArray,
                      true, false
                    ]
                  });

                  style.layers.splice(dimInd, 0,{
                    'id':"parcel",
                    'source':"tiles",
                    'source-layer':"parcels",
                    'type':"fill",
                    'paint':{
                      "fill-opacity": 0.4,
                      "fill-color": "white",
                    },
                    'filter':[
                      "match",
                      ["id"], parcelArray,
                      true, false
                    ]
                  });

                  style.layers.push(...[
                    {
                      'id':"parcel-label",
                      'source':"tiles",
                      'source-layer':"parcels-centroids",
                      'type':"symbol",
                      'paint':{
                        "text-color": "black",
                        "text-opacity": 0.7,
                        "text-halo-width": 1,
                        "text-halo-color": "white",
                      },
                      'layout':{
                        "text-field": ["get", "parcel_no"],
                        "text-anchor": "bottom",
                        "text-font": ["Montserrat SemiBold"],
                        "text-size": 16,
                        "text-padding": 12,
                      },
                      'filter':[
                        "match",
                        ["id"], parcelArray,
                        true, false
                      ]
                    }
                  ])
                }else{
                  console.log('Highlight one parcel', parcel)
                  const dimInd = style.layers.findIndex(l=>l.id==="dimensions")
                  const rdInd = style.layers.findIndex(l=>l.id==="road-label")

                  style.layers[dimInd].filter = ["==", ["get", "parcel_objectid"], Number(parcel) ]
                  
                  style.layers.splice(rdInd, 0,{
                    'id':"parcel-line",
                    'source':"tiles",
                    'source-layer':"parcels",
                    'type':"line",
                    'minzoom':13,
                    'maxzoom':22,
                    'paint':{
                      "line-color": "white",
                      "line-opacity": 1,
                      "line-width": 4,
                    },
                    'filter':[
                      "match",
                      ["id"], Number(parcel),
                      true, false
                    ]
                  });

                  style.layers.splice(dimInd, 0,{
                    'id':"parcel",
                    'source':"tiles",
                    'source-layer':"parcels",
                    'type':"fill",
                    'paint':{
                      "fill-opacity": 0.4,
                      "fill-color": "white",
                    },
                    'filter':[
                      "match",
                      ["id"], Number(parcel),
                      true, false
                    ]
                  });

                  style.layers.push(...[
                    {
                      'id':"parcel-label",
                      'source':"tiles",
                      'source-layer':"parcels-centroids",
                      'type':"symbol",
                      'paint':{
                        "text-color": "black",
                        "text-opacity": 0.7,
                        "text-halo-width": 1,
                        "text-halo-color": "white",
                      },
                      'layout':{
                        "text-field": ["get", "parcel_no"],
                        "text-anchor": "bottom",
                        "text-font": ["Montserrat SemiBold"],
                        "text-size": 16,
                        "text-padding": 12,
                      },
                      'filter':[
                        "match",
                        ["id"], Number(parcel),
                        true, false
                      ]
                    }
                  ])
                }
              }
            }else{
              style = JSON.parse(style)
            }
        } catch (jsonErr) {
            console.error('Error parsing JSON style in request: %j', jsonErr)
            return next(
                new restifyErrors.BadRequestError(
                    { cause: jsonErr },
                    'Error parsing JSON style'
                )
            )
        }
    }

    if (center !== null) {
        if (typeof center === 'string') {
            center = parseListToFloat(center)
        }

        if (center.length !== 2) {
            return next(
                new restifyErrors.BadRequestError(
                    `Center must be longitude,latitude.  Invalid value found: ${[
                        ...center,
                    ]}`
                )
            )
        }

        if (!Number.isFinite(center[0]) || Math.abs(center[0]) > 180) {
            return next(
                new restifyErrors.BadRequestError(
                    `Center longitude is outside world bounds (-180 to 180 deg): ${center[0]}`
                )
            )
        }

        if (!Number.isFinite(center[1]) || Math.abs(center[1]) > 90) {
            return next(
                new restifyErrors.BadRequestError(
                    `Center latitude is outside world bounds (-90 to 90 deg): ${center[1]}`
                )
            )
        }
    }
    if (zoom !== null) {
        zoom = parseFloat(zoom)
        if (zoom < 0 || zoom > 22) {
            return next(
                new restifyErrors.BadRequestError(
                    `Zoom level is outside supported range (0-22): ${zoom}`
                )
            )
        }
    }
    if (ratio !== null) {
        ratio = parseInt(ratio, 10)
        if (!ratio || ratio < 1) {
            return next(
                new restifyErrors.BadRequestError(
                    `Ratio is outside supported range (>=1): ${ratio}`
                )
            )
        }
    }
    if (bounds !== null) {
        if (typeof bounds === 'string') {
            bounds = parseListToFloat(bounds)
        }

        if (bounds.length !== 4) {
            return next(
                new restifyErrors.BadRequestError(
                    `Bounds must be west,south,east,north.  Invalid value found: ${[
                        ...bounds,
                    ]}`
                )
            )
        }
        for (const b of bounds) {
            if (!Number.isFinite(b)) {
                return next(
                    new restifyErrors.BadRequestError(
                        `Bounds must be west,south,east,north.  Invalid value found: ${[
                            ...bounds,
                        ]}`
                    )
                )
            }
        }

        const [west, south, east, north] = bounds
        if (west === east) {
            return next(
                new restifyErrors.BadRequestError(
                    `Bounds west and east coordinate are the same value`
                )
            )
        }
        if (south === north) {
            return next(
                new restifyErrors.BadRequestError(
                    `Bounds south and north coordinate are the same value`
                )
            )
        }

        if (padding) {
            // padding must not be greater than width / 2 and height / 2
            if (Math.abs(padding) >= width / 2) {
                return next(
                    new restifyErrors.BadRequestError(
                        'Padding must be less than width / 2'
                    )
                )
            }
            if (Math.abs(padding) >= height / 2) {
                return next(
                    new restifyErrors.BadRequestError(
                        'Padding must be less than height / 2'
                    )
                )
            }
        }
    }

    if (bearing !== null) {
        if (bearing < 0 || bearing > 360) {
            return next(
                new restifyErrors.BadRequestError(
                    `Bearing is outside supported range (0-360): ${bearing}`
                )
            )
        }
    }

    if (pitch !== null) {
        if (pitch < 0 || pitch > 60) {
            return next(
                new restifyErrors.BadRequestError(
                    `Pitch is outside supported range (0-60): ${pitch}`
                )
            )
        }
    }

    if (!((center && zoom !== null) || bounds)) {
        return next(
            new restifyErrors.BadRequestError(
                'Either center and zoom OR bounds must be provided'
            )
        )
    }

    try {
        render(style, parseInt(width, 10), parseInt(height, 10), {
            zoom,
            center,
            bounds,
            padding,
            tilePath,
            ratio,
            bearing,
            pitch,
            token,
        })
            .then((data, rejected) => {
                if (rejected) {
                    console.error('render request rejected', rejected)
                    return next(
                        new restifyErrors.InternalServerError(
                            { cause: rejected },
                            'Error processing render request'
                        )
                    )
                }
                return response.sendRaw(200, data, {
                    'content-type': 'image/png',
                })
            })
            .catch((err) => {
                if (err instanceof restifyErrors.InternalServerError) {
                    return next(err)
                }

                console.error('Error processing render request', err)
                return next(
                    new restifyErrors.InternalServerError(
                        { cause: err },
                        'Error processing render request'
                    )
                )
            })
    } catch (err) {
        if (err instanceof restifyErrors.InternalServerError) {
            return next(err)
        }

        console.error('Error processing render request', err)
        return next(
            new restifyErrors.InternalServerError(
                { cause: err },
                'Error processing render request'
            )
        )
    }

    return null
}

// Provide the CLI
cli.version(version)
    .description('Start a server to render Mapbox GL map requests to images.')
    .option('-p, --port <n>', 'Server port', parseInt)
    .option(
        '-t, --tiles <mbtiles_path>',
        'Directory containing local mbtiles files to render'
    )
    .option('-v, --verbose', 'Enable request logging')
    .parse(process.argv)

const { port = 8000, tiles: tilePath = null, verbose = false } = cli

export const server = restify.createServer({
    ignoreTrailingSlash: true,
})
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())
server.use(
    restifyValidation.validationPlugin({
        errorsAsArray: false,
        forbidUndefinedVariables: false,
        errorHandler: restifyErrors.BadRequestError,
    })
)

if (verbose) {
    server.use(
        logger('dev', {
            // only log valid endpoints
            // specifically ignore health check endpoint
            skip: function (req, res) {
                return req.statusCode === 404 || req.path() === "/health"
            },
        })
    )
}

/**
 * /render (GET): renders an image based on request query parameters.
 */
server.get(
    {
        url: '/render',
        validation: {
            queries: PARAMS,
        },
    },
    (req, res, next) => renderImage(req.query, res, next, tilePath)
)

/**
 * /render (POST): renders an image based on request body.
 */
server.post(
    {
        url: '/render',
        validation: {
            content: PARAMS,
        },
    },
    (req, res, next) => renderImage(req.body, res, next, tilePath)
)

/**
 * List all available endpoints.
 */
server.get({ url: '/' }, (req, res) => {
    const routes = {}
    Object.values(server.router.getRoutes()).forEach(
        ({ spec: { url, method } }) => {
            if (!routes[url]) {
                routes[url] = []
            }
            routes[url].push(method)
        }
    )

    res.send({
        routes,
        version,
    })
})


/**
 * /health: returns 200 to confirm that server is up
 */
server.get({url: '/health'}, (req, res, next) => {
    res.send(200)
    next()
})

if (tilePath !== null) {
    if (!fs.existsSync(tilePath)) {
        raiseError(`Path to mbtiles files does not exist: ${tilePath}`)
    }

    console.log('Using local mbtiles in: %j', tilePath)
}

server.listen(port, () => {
    console.log(
        'Mapbox GL static rendering server started and listening at %s',
        server.url
    )
})

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

process.on('beforeExit', code => {
  // Can make asynchronous calls
  setTimeout(() => {
    console.log(`Process will exit with code: ${code}`)
    process.exit(code)
  }, 100)
})

process.on('exit', code => {
  // Only synchronous calls
  console.log(`Process exited with code: ${code}`)
})

export default { server }
