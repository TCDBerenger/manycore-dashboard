var express = require('express');
var router = express.Router();
//var mongoose = require('mongoose');
//var Post = mongoose.model('Post');
//var Comment = mongoose.model('Comment');


var profiles = [
		{id: 101, label: 'Sample #1'},
		{id: 102, label: 'Example #2'},
		{id: 103, label: 'Instance #3'},
		{id: 104, label: 'Try #4'},
		{id: 105, label: 'Attempt #5'},
		{id: 106, label: 'Trial #6'},
		{id: 107, label: 'Test #7'}
	];

/* GET profiles listing. */
router.get('/', function(req, res, next) {
	res.json(profiles);
});

/* GET profiles data. */
router.get('/*', function(req, res) {
	
	var ids = req.params[0].split('-');
	var selected = [];
	
	ids.forEach(function(id, id_index, id_array) {
		profiles.forEach(function(profile, profile_index, profile_array) {
			if (id == profile.id) {
				selected.push(profile);
			}
		})
	});
	
	res.json(selected);
});

/*
router.param('profile', function(req, res, next) {
	
	/*
	var profile;
	profiles.forEach(function(element, index, array) {
		if (element.id == id) {
			profile = element;
		}
	});
	
	if (!profile) { return next(new Error('can\'t find profile')); }
	
	req.profile = profile;
    return next();
	* /
});
*/

module.exports = router;
