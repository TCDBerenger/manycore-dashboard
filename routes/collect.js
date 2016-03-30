/************************************************/
/* Import JS libraries							*/
/************************************************/
var express = require('express');
var bodyParser = require('body-parser');

// ExpressJS vars
var router = express.Router();
var jsonParser = bodyParser.json()

// Files
var mkdirp = require('mkdirp');
var fs = require('fs');


/************************************************/
/* Functions - Utils							*/
/************************************************/
/**
 * Validate number
 */
function normalInteger(value) {
	return (value < 100 && value > 0 && value == ~~value) ? value : 0; 
}
/**
 * Adding leading zero
 */
function zeroPad(value) {
	return (value < 10) ? '0' + value : value;
}

/************************************************/
/* Functions - Global							*/
/************************************************/
/**
 * Get details data
 */

// POST /api/users gets JSON bodies
router.post('/api/users', jsonParser, function (req, res) {
	// Precondition
	if (! request.body) return response.status(400).send('Missing content');
	
	// Collect xp data
	var xp = {
		id:			normalInteger(request.body.id),
		version:	normalInteger(request.body.version),
		step:		normalInteger(request.body.step),
		data:		request.body.data,
	}
	
	// Collect meta data
	var meta = {
		user:		request.body.user,
		folder:		'./results/xp-' + zeroPad(xp.id) + '.' + xp.version + '/',
		file:		request.body.user +'.txt',
	};
	// Check folder
	mkdirp(meta.folder, function(folderError) {
		// Error while handle file folder
		if (folderError) {
			console.error('KO folder', folderError, meta, xp);
			return response.status(500).send('The experiment folder is not writable.');
		}
		// Folder is ok, go ahead
		else {
			// Append data
			fs.appendFile(meta.folder + meta.file, xp.data + '\n', function (fileError) {
				if (fileError) {
					console.error('KO file', fileError, meta, xp);
					return response.status(500).send('The server failed to save the experiment gathered data.');
				} else {
					console.log('OK', meta.user, xp.step);
					return response.send('The server successfully saved the experiment gathered data.');
				}
			});
		}
		
	});
});

module.exports = router;