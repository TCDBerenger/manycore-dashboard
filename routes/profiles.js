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

var profileIJK =	{ id: 1,	label: 'Matmul IJK',	desc: 'Matrix multiplication IJK', 	hardware: hardRoman };
var profileKIJ =	{ id: 2,	label: 'Matmul KIJ',	desc: 'Matrix multiplication KIJ', 	hardware: hardRoman };
var profileKJI =	{ id: 3,	label: 'Matmul KJI',	desc: 'Matrix multiplication KJI', 	hardware: hardRoman };
var profilePS =		{ id: 4,	label: 'Particle S',	desc: 'Particle system (serial)', 	hardware: hardRoman };
var profileAB =		{ id: 5,	label: 'Account B',		desc: '',		hardware: hardRoman };
var profileCPi =	{ id: 6,	label: 'Compute Pi',	desc: '',		hardware: hardRoman };
var profileMlb =	{ id: 7,	label: 'Mandelbrot',	desc: '',		hardware: hardRoman };
var profileNQ =		{ id: 8,	label: 'N Queens',		desc: '',		hardware: hardRoman };
var profileRT =		{ id: 9,	label: 'Ray Tracer',	desc: '',		hardware: hardRoman };
var profileAA =		{ id: 10,	label: 'Account A',		desc: '',		hardware: hardRoman };
var profileMSP =	{ id: 11,	label: 'Merge sort P',	desc: 'Merge and sort (parallel)',	hardware: hardRoman };
var profileMSS =	{ id: 12,	label: 'Merge sort S',	desc: 'Merge and sort (serial)',	hardware: hardRoman };
var profilePP =		{ id: 13,	label: 'Particle P',	desc: 'Particle system (parallel)',	hardware: hardRoman };

var profiles = {
	1: profileIJK,	5: profileAB,	9: profileRT,	13: profilePP,
	2: profileKIJ,	6: profileCPi,	10: profileAA,
	3: profileKJI,	7: profileMlb,	11: profileMSP,
	4: profilePS,	8: profileNQ,	12: profileMSS,
	all: [profileIJK, profileKIJ, profileKJI, profilePS, profileAB, profileCPi, profileMlb, profileNQ, profileRT, profileAA, profileMSP, profileMSS, profilePP]
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
