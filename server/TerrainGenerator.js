function TerrainGenerator(seed, update_callback) {
	this.seed = seed;
	this.update_callback = update_callback;
	this.generateQueue = [];
	this.working = false;
	this.fastMode = false;
	console.log("TerrainGenerator created with seed '"+this.seed+"'");
}

var BLOCKSIZE = TerrainConstants.CHUNKSIZE;
var OCTAVES = Config.GENERATOR_OCTAVES;
var md5 = require('MD5'); // For Node.JS

TerrainGenerator.prototype.generate = function(x, y, callback)
{
	for(var i = 0; i < this.generateQueue.length; i++) {
		if(this.generateQueue[i].x == x && this.generateQueue[i].y == y) {
			this.generateQueue[i].done_callback.push(callback);
			return;
		}
	}
	var callbacks
	if(typeof callback == "object") {
		callbacks = callback;
	} else {
		callbacks = [];
		if(typeof callback != "undefined") {
			callbacks.push(callback);
		}
	}
	this.generateQueue.push({x: x, y: y, done_callback: callbacks});
}

TerrainGenerator.prototype.run = function()
{
	if(!this.working) {
		if(this.generateQueue.length == 0) return;
		var job = this.generateQueue[0];
		startGeneratingChunk(this, job);
	}
}

function startGeneratingChunk(terraingen, job)
{
	console.log("Starting chunk generation at "+job.x+","+job.y);
	terraingen.working = true;
	job.status = {status: "init"};
	terraingen.work_timer = setInterval(function() { generateChunk(terraingen, job); }, this.fastMode ? 0 : 50);
}

var INITIAL_TABLE_ROWS_AT_TIME = 12;
function generateChunk(terraingen, job)
{
	if(job.status.status == "init") {
		job.status.status = "generating initial table";
		job.status.baseNoise = GetEmptyArray(BLOCKSIZE+1, BLOCKSIZE+1);
		job.status.currentRow = 0;
		terraingen.update_callback(job);
	}
	if(job.status.status == "generating initial table") {
		for(var startRow = job.status.currentRow; job.status.currentRow < startRow+INITIAL_TABLE_ROWS_AT_TIME && job.status.currentRow <= BLOCKSIZE; job.status.currentRow++) {
			for(var y = 0; y <= BLOCKSIZE; y++) {
				job.status.baseNoise[job.status.currentRow][y] = HashCoords(terraingen.seed, job.x*BLOCKSIZE+job.status.currentRow, job.y*BLOCKSIZE+y);
			}
		}
		if(job.status.currentRow > BLOCKSIZE) {
			job.status.status = "generating octaves";
			delete job.status.currentRow;
			job.status.currentOctave = 0;
			job.status.smoothNoise = [];
		}
		terraingen.update_callback(job);
		return;
	}
	if(job.status.status == "generating octaves") {
		job.status.smoothNoise[job.status.currentOctave] = GenerateSmoothNoise(job.status.baseNoise, job.status.currentOctave);
		job.status.currentOctave++;
		if(job.status.currentOctave >= OCTAVES) {
			job.status.status = "blending octaves";
			delete job.status.baseNoise;
			delete job.status.currentOctave;
		}
		terraingen.update_callback(job);
		return;
	}
	if(job.status.status == "blending octaves") {
		job.data = GeneratePerlinNoise(job.status.smoothNoise);
		delete job.status;
		terraingen.generateQueue.splice(0, 1);
		clearInterval(terraingen.work_timer);
		delete terraingen.work_timer;
		terraingen.working = false;
		var done_cb = job.done_callback;
		delete job.done_callback;
		terraingen.update_callback(job);
		for(var i = 0; i < done_cb.length; i++) done_cb[i](job);
	}
}

////////////////////////////////////////////////////

// TODO: Find quicker hashing function
function HashCoords(seed, x, y)
{
	//return (CryptoJS.MD5(seed+","+x+","+y).words[0]+2147483648)/4294967295; // For browser
	return parseInt(md5(seed+","+x+","+y).substr(0, 8), 16)/4294967295; // For Node.JS
}

function GetEmptyArray(w, h)
{
	var a = [];
	for(var i = 0; i < w; i++) {
		var b = [];
		for(var j = 0; j < h; j++) {
			b.push(0);
		}
		a.push(b);
	}
	return a;
}

// Based on http://devmag.org.za/2009/04/25/perlin-noise/

function GenerateSmoothNoise(baseNoise, octave)
{
	var width = baseNoise.length;
	var height = baseNoise[0].length;

	var smoothNoise = GetEmptyArray(width, height);

	var samplePeriod = 1 << octave; // calculates 2 ^ k
	var sampleFrequency = 1.0 / samplePeriod;

	for (var i = 0; i < width; i++)
	{
		//calculate the horizontal sampling indices
		var sample_i0 = Math.floor(i / samplePeriod) * samplePeriod;
		var sample_i1 = (sample_i0 + samplePeriod) % width; //wrap around
		var horizontal_blend = (i - sample_i0) * sampleFrequency;

		for (var j = 0; j < height; j++)
		{
			//calculate the vertical sampling indices
			var sample_j0 = Math.floor(j / samplePeriod) * samplePeriod;
			var sample_j1 = (sample_j0 + samplePeriod) % height; //wrap around
			var vertical_blend = (j - sample_j0) * sampleFrequency;

			//blend the top two corners
			var top = Interpolate(baseNoise[sample_i0][sample_j0], baseNoise[sample_i1][sample_j0], horizontal_blend);

			//blend the bottom two corners
			var bottom = Interpolate(baseNoise[sample_i0][sample_j1], baseNoise[sample_i1][sample_j1], horizontal_blend);

			//final blend
			smoothNoise[i][j] = Interpolate(top, bottom, vertical_blend);
		}
	}

	return smoothNoise;
}

function Interpolate(x0, x1, alpha)
{
	return x0 * (1 - alpha) + alpha * x1;
}

function GeneratePerlinNoise(smoothNoise)
{
	var width = smoothNoise[0].length;
	var height = smoothNoise[0][0].length;
	var octaveCount = smoothNoise.length;

	var persistance = 0.5;

	var perlinNoise = GetEmptyArray(width, height);
	var amplitude = 1.0;
	var totalAmplitude = 0.0;

	//blend noise together
	for (var octave = octaveCount - 1; octave >= 0; octave--)
	{
		amplitude *= persistance;
		totalAmplitude += amplitude;

		for (var i = 0; i < width; i++)
		{
			for (var j = 0; j < height; j++)
			{
				perlinNoise[i][j] += smoothNoise[octave][i][j] * amplitude;
			}
		}
	}

	//normalisation
	for (var i = 0; i < width; i++)
	{
		for (var j = 0; j < height; j++)
		{
			perlinNoise[i][j] /= totalAmplitude;
		}
	}

	return perlinNoise;
}

module.exports = TerrainGenerator;
