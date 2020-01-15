const express = require('express');

const router = express.Router();
const Reports = require('../models/reports');


router.get('/', (req, res, next) => {
    let data = {
        layout: false
    }
    res.render('index', data);
});


router.get('/logout', (req, res, next) => {
    res.render('logout');
});

module.exports = router;