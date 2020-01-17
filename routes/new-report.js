const express = require('express');
const uploadCloud = require('../config/cloudinary');
const Reports = require('../models/reports');


const router = express.Router();

/* Sera que vai 2?*/

// router.get('auth/new-report', (req, res, next) => {
//     res.render('new-report');
// });

// router.post('/new-report', uploadCloud.single('picture'), (req, res, next) => {
//     const { street, number, city, category, description } = req.body;
//     const picture = req.file.url;


//     console.log('XXXXXXXXXXXX', req.body)

//     const newReport = new Reports({
//         owner_ID: req.user._id,
//         location: {
//             street,
//             number,
//             city,
//         },
//         category,
//         picture,
//         description,
//     });

//     newReport.save()
//         .then(() => {
//             res.redirect('/dashboard');
//         })
//         .catch(error => {
//             console.log(error);
//         })
// });
module.exports = router;