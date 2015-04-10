var express = require('express');
var router = express.Router();


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

module.exports = router;
