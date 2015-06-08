/************************************************/
/* Import JS libraries							*/
/************************************************/
var express = require('express');
var router = express.Router();


/************************************************/
/* Import profiles								*/
/************************************************/
var profiles = require('./common/profiles.common.js');


/* GET profiles listing. */
router.get('/', function(req, res, next) {
	var all = [];

	profiles.all.forEach(function(profile) {
		all.push({
			id:			profile.id,
			label:		profile.label,
			desc:		profile.desc,
			hardware:	profile.hardware
		});
	});

	res.json(all);
});

/* GET profiles data. */
router.get('/*', function(req, res) {
	
	var ids = req.params[0].split('-');
	var selected = [];
	var selectedMap = {};
	
	ids.forEach(function(id) {
		if (profiles.hasOwnProperty(id) && ! selectedMap.hasOwnProperty(id)) {
			selected.push({
				id:			profiles[id].id,
				label:		profiles[id].label,
				desc:		profiles[id].desc,
				hardware:	profiles[id].hardware,
				version:	profiles[id].v
			});
			selectedMap[id] = true;
		}
	});
	
	res.json(selected);
});

module.exports = router;
