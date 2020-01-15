const express = require('express');

const router = express.Router();
const Report = require('../models/reports');


router.get('/', (req, res, next) => {
    Report.find()
   .then(reports =>
    res.render('index', {user: req.user, reports })
   )
});


router.get('/logout', (req, res, next) => {
    res.render('logout');
});


// router.get('/allreports', (req, res, next) => {
//     res.render('allreports');
// });

// router.get('/details', (req, res, next) => {
//     res.render('details');
// });

module.exports = router;