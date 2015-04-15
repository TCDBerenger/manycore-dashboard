var express = require('express');
var router = express.Router();

var hardRoman = {
	label:	'Intel i7-950 with 12 GB RAM',
	cpu: {
		label:	'Intel® Core™ i7-950',
		link:	'http://ark.intel.com/products/37150/Intel-Core-i7-950-Processor-8M-Cache-3_06-GHz-4_80-GTs-Intel-QPI',
		model:	'i7-950',
		type:	'64 bits',
		cores:	'4 cores / 8 threads',
		clock:	'3.06 GHz',
		l1:		'32 KB',
		l2:		'256 KB',
		l3:		'8 MB'
	},
	ram:	'12 279 MB'
};


var profiles = [
		{id: 1, tag: 'matmulijk',	label: 'Matmul IJK',	desc: 'Matrice multiplication IJK', 	hardware: hardRoman}
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
