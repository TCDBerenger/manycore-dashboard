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

var profileIJK = {id: 1, tag: 'matmulijk',	label: 'Matmul IJK',	desc: 'Matrice multiplication IJK', 	hardware: hardRoman};
var profileKIJ = {id: 2, tag: 'matmulkij',	label: 'Matmul KIJ',	desc: 'Matrice multiplication KIJ', 	hardware: hardRoman};
var profileKJI = {id: 3, tag: 'matmulkji',	label: 'Matmul KJI',	desc: 'Matrice multiplication KJI', 	hardware: hardRoman};

var profiles = {
	1: profileIJK,
	2: profileKIJ,
	3: profileKJI,
	all: [profileIJK, profileKIJ, profileKJI]
};

/* GET profiles listing. */
router.get('/', function(req, res, next) {
	res.json(profiles.all);
});

/* GET profiles data. */
router.get('/*', function(req, res) {
	
	var ids = req.params[0].split('-');
	var selected = [];
	
	ids.forEach(function(id) {
		selected.push(profiles[id]);
	});
	
	res.json(selected);
});

module.exports = router;
