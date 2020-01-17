const express = require('express');

const router = express.Router();
const Report = require('../models/reports');


router.get('/', (req, res, next) => {
    Report.find()
   .then(reports =>
    res.render('index', {user: req.user, reports })
   )
});

router.get('/api', (req, res, next) => {
    Report.find()
    .then(reports => res.json(reports))
    .catch(error => console.log(error))
});


module.exports = router;