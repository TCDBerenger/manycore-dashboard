var express = require('express');
var router = express.Router();

/**
 * Task granularity
 */
function jsonTG(id) {
	var output = {};

	output.id = id;
	output.cat = 'tg';
	output.log = "TODO";

	return output;
}

/**
 * Synchronisation
 */
function jsonSY(id) {
	var output = {};

	output.id = id;
	output.cat = 'sy';
	output.log = "TODO";

	return output;
}

/**
 * Data sharing
 */
function jsonDS(id) {
	var output = {};

	output.id = id;
	output.cat = 'ds';
	output.log = "TODO";

	return output;
}

/**
 * Load balancing
 */
function jsonLB(id) {
	var output = {};

	output.id = id;
	output.cat = 'lb';
	output.log = "TODO";

	return output;
}

/**
 * Data locality
 */
function jsonDL(id) {
	var output = {};

	output.id = id;
	output.cat = 'dl';
	output.log = "TODO";

	return output;
}

/**
 * Resource sharing
 */
function jsonRS(id) {
	var output = {};

	output.id = id;
	output.cat = 'rs';
	output.log = "TODO";

	return output;
}

/**
 * Input / Outp
 */
function jsonIO(id) {
	var output = {};

	output.id = id;
	output.cat = 'io';
	output.log = "TODO";

	return output;
}


/**
 * Get details data
 */
router.get('/*', function(request, response) {
	
	var params = request.params[0].split('/');
	var cat = params[0];
	var id = params[1];

	if (cat && cat.length == 2 && id && isFinite(id)) {
		switch(cat) {
			case 'tg':	response.json(jsonTG(id)); break;
			case 'sy':	response.json(jsonSY(id)); break;
			case 'ds':	response.json(jsonDS(id)); break;
			case 'lb':	response.json(jsonLB(id)); break;
			case 'dl':	response.json(jsonDL(id)); break;
			case 'rs':	response.json(jsonRS(id)); break;
			case 'io':	response.json(jsonIO(id)); break;
			default:	response.send("Illegal category");
		}
	} else {
		response.send("Illegal parameters");
	}
});

module.exports = router;
