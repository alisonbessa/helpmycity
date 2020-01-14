const express = require('express');

const router = express.Router();
const Reports = require('../models/reports');


router.get('/', (req, res, next) => {
    let data = {
        layout: false
    }
    res.render('index', data);
});

router.get('/dashboard', (req, res, next) => {
    Reports.find()
        .then(reports =>
            res.render('dashboard', {
                reports
        })
    )}
);

router.get('/login', (req, res, next) => {
    res.render('login');
});

router.get('/signup', (req, res, next) => {
    res.render('signup');
});

router.get('/logout', (req, res, next) => {
    res.render('logout');
});

module.exports = router;