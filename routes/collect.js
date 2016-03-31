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
 * Post (collect) xp experiment
 */
router.post('/', jsonParser, function (request, response) {
	// Precondition
	if (! request.body) {
		console.log(400, 'Missing content');
		console.error(400, 'Missing content');
		return response.status(400).send('Missing content');
	}
	
	// Collect data
	var xp_id =			normalInteger(request.body.xp_id);
	var user_id =		request.body.user_id.substr(0, 8);
	var meta_folder =	'./results/xp-' + zeroPad(xp_id) + '/';
	var meta_path =		meta_folder + user_id +'.log';
	
	// Check folder
	mkdirp(meta_folder, function(folderError) {
		// Error while handle file folder
		if (folderError) {
			console.error('KO folder', folderError, meta, xp);
			return response.status(500).send('The experiment folder is not writable.');
		}
		// Folder is ok, go ahead
		else {
			// Append data
			fs.appendFile(meta_path, JSON.stringify(request.body) + '\r\n', function (fileError) {
				if (fileError) {
					console.error('KO file', fileError, xp_id, user_id, meta_path);
					return response.status(500).send('The server failed to save the experiment gathered data.');
				} else {
					console.log('OK', user_id);
					return response.send('The server successfully saved the experiment gathered data.');
				}
			});
		}
		
	});
});

module.exports = router;