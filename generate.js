var tileGenerator = require('tile-generator');
var tilebelt = require('@mapbox/tilebelt');
var fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { performance } = require('perf_hooks');
const cliProgress = require('cli-progress');
const prettyMilliseconds = require('pretty-ms');

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
let totalWorldTiles;

async function genWorld(){
  const wholeWorld = await generateUrls({minzoom:0, maxzoom:10});
  totalWorldTiles = wholeWorld.length;
  console.log(`
  The whole world consists of ${wholeWorld.length} tiles
  `);  
}



/**
 * 
 * @param {{
 *  minzoom?: number,
 *  maxzoom?: number,
 *  style: string,
 *  bounds?: number[],
 *  tilesize?: number,
 *  basePath?: string
 * }} options
 */
async function generate({
  bounds=[-180, -85, 180, 85], 
  minzoom=0, 
  maxzoom=12, 
  style, 
  tilesize=512,
  basePath='./' + style.split('/').slice(-1)[0].split('.')[0] + '/'
}) {
  genWorld();
  console.log(`
  Generating tiles...
  `);
  const tileSpecs = await generateUrls({bounds, minzoom, maxzoom});
  await generateTiles({tileSpecs, style, tilesize, basePath});

  return tileSpecs;
}

/**
 * 
 * @param {{
 *  minzoom?: number,
 *  maxzoom?: number,
 *  bounds?: number[],
 * }} options
 */
async function generateUrls({
  bounds=[-180, -85, 180, 85], 
  minzoom=0, 
  maxzoom=12, 
}) {
  var tiles = [];

  for (var z = minzoom; z <= maxzoom; z++) {
    tileGenerator(z, bounds)
    .on('data', function (tile) {
      const bounds = tilebelt.tileToBBOX(tile).join(',');
      const path = [tile[2],tile[0],tile[1]].join('/');
      tiles.push({bounds, path, zoom:z});
    })
  }
  return tiles;
}

async function generateTile({bounds, path, zoom, basePath, tilesize, style}) {
 
  if(!fs.existsSync(basePath+path.split('/').slice(0,-1).join('/')) ) {
    fs.mkdirSync(basePath+path.split('/').slice(0,-1).join('/'), { recursive: true });
  }

  const command = `node dist/cli ${style} ${basePath+path+'.png'} ${tilesize} ${tilesize} -b ${bounds} -z ${zoom}`
  
  try {
    const { stdout, stderr } = await exec(command);
    if(stderr) console.log('stderr:', stderr);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
  return;
}

/**
 * 
 * @param {{
 *  tileSpecs: {bounds:string, path:string}[],
 *  style: string,
 *  tilesize?: number,
 *  basePath?: string
 * }} options
 */
async function generateTiles({
  tileSpecs,
  style, 
  tilesize,
  basePath='./' + style.split('/').slice(-1)[0].split('.')[0] + '/'
}) {
  bar.start(tileSpecs.length, 0);

  for (var i = 0; i < tileSpecs.length; i++) {
    const v = tileSpecs[i];
    await generateTile({bounds:v.bounds, path:v.path, zoom:v.zoom, basePath, tilesize, style})
    bar.update(i);
  }
}

var startTime = performance.now();
generate({
  style: './styles/OldStyle.json',
  basePath: './tiles/OldStyle/',
  maxzoom: 10
}).then((d)=>{

  bar.update(d.length);
  bar.stop();
  var endTime = performance.now()
  console.log(`
    Last tile: `, d[d.length-1].path);
  console.log('Number of generated tiles: ', d.length);
  console.log(`Generating tiles took ${prettyMilliseconds(endTime - startTime)}`)
  console.log(`
  Generating the whole world would take ${
    prettyMilliseconds(totalWorldTiles * (endTime - startTime)/d.length)
  }
  `)
  return;
}).catch((e)=>{
  console.error(e);
});
