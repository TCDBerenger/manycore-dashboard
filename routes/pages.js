var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'ManyCore Dashboard'
	});
});

/* GET dashboard page */
router.get('/dashboard.html', function(req, res, next) {
	res.render('dashboard', {
	});
});

/* GET detail page */
router.get('/detail.html', function(req, res, next) {
	res.render('detail', {
	});
});

module.exports = router;
