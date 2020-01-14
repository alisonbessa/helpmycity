const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index');
});

router.get('/dashboard', (req, res, next) => {
    res.render('dashboard');
});

router.get('/login', (req, res, next) => {
    res.render('login');
});



router.get('/logout', (req, res, next) => {
    res.render('logout');
});

module.exports = router;