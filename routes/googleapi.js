const express = require('express');
const Reports = require('../models/reports');

const Reports = express.Router();

router.get('/', (req, res) => {
  Places.find()
    .then((response) => res.json(response))
    .catch((err) => {
      throw new Error(err);
    });
});

module.exports = router;
