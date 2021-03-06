const express       = require("express");
const User          = require("../models/user");
const Report        = require("../models/reports");
const Reports       = require("../models/reports");
const uploadCloud   = require("../config/cloudinary");
const passport      = require("passport");
const flash         = require("connect-flash");
const cloudinary    = require("cloudinary").v2.api;
const ensureLogin   = require("connect-ensure-login");
const localStrategy = require('passport-local').Strategy;

const router = express.Router();

// BCRYPT TO ENCRYPT PASSWORDS
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

// SIGNUP ROUTE
router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", (req, res, next) => {
  const { name, email, password } = req.body;

  if (email === "" || password === "" || name === "") {
    res.render("signup", {
      message: "Por favor insira o nome do usuário, um e-mail e senha"
    });
  }

  // SIGNUP - User verification
  User.findOne({ email }).then(user => {
    if (user !== null) {
      res.render("signup", { message: "O e-mail já está cadastrado" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashPass
    });

    newUser.save(err => {
      if (err) {
        res.render("signup", {
          message: "Não foi possível efetivar o cadastro"
        });
      } else {
        res.redirect("/login");
      }
    });
    res.render("login");
  });
});

// SIGN IN ROUTE ============> TESTAR
router.get("/login", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  } else {
    return res.render("login", {
      message: req.flash("error")
    });
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

// ALLREPORTS ROUTE
router.get("/allreports", (req, res, next) => {
  Reports.find()
    .sort({ category: 1 })
    .then(reports => res.render("allreports", { reports }));
});

router.post("/allreports", (req, res, next) => {
  Reports.find({ category: req.body.category })
    .then(reports => {
      if (reports.length > 0) {
        res.render("allreports", { reports });
        return;
      } else {
        req.flash("error", "");
        res.render("allreports", { message: req.flash("error") });
        return;
      }
    })
    .catch(error => console.log(error));
});

// DETAILS ROUTE
router.get("/details/:id", (req, res, next) => {
  const { id } = req.params;
  Reports.findById(id)
    .then(report => {
      User.findById(report.owner_ID)
      .then(nameOfUser => {
        res.render("details", {report, nameOfUser });
      })
      .catch(error => next(error));
    })
    .catch(error => next(error));
});

//! PRIVATE ROUTES ==== START ====

// DASHBOARD ROUTE
router.get("/dashboard", ensureAuthenticated, (req, res, next) => {
  Reports.find({ owner_ID: req.user._id })
    .sort({ category: 1 })
    .then(reports => res.render("dashboard", { user: req.user, reports }));
});

// EDIT ROUTE - GET
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  const { id } = req.params;

  Reports.findById(id)
    .then(report => {
      res.render("edit", { report });
    })
    .catch(error => next(error));
});

// EDIT ROUTE - POST
router.post("/edit/:id", ensureAuthenticated, (req, res, next) => {
  const { id } = req.params;
  const { street, number, city, category, description } = req.body;
  const newReport = {
    address: {
      street,
      number,
      city
    },
    category,
    description
  };
 
  Report.findByIdAndUpdate(id, newReport)
    .then(_ => res.redirect("/dashboard"))
    .catch(error => next(error));
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  const { id } = req.params;

  Report.findById(id)
    .then(report => {
      res.render("edit", { report });
    })
    .catch(error => next(error));
});

router.get("/delete-report/:id", ensureAuthenticated, (req, res, next) => {
  const { id } = req.params;
  Report.findByIdAndDelete(id)
    .then(del => {
      res.redirect("/dashboard");
    })
    .catch(error => next(error));
});

// NEW REPORT ROUTE

router.get("/new-report", ensureAuthenticated, (req, res, next) => {
  res.render("new-report");
});

router.post("/new-report", ensureAuthenticated, uploadCloud.single("picture"), (req, res, next) => {
    const { street, number, city, category, description } = req.body;
    const picture = req.file.url;
    let cloudlatOfPhoto = 00;
    let cloudlongOfPhoto = 00;

    cloudinary
      .resource(req.file.public_id, { exif: true })
      .then(response => {
        const {
          GPSLatitude,
          GPSLatitudeRef,
          GPSLongitude,
          GPSLongitudeRef
        } = response.exif;
        
        
        if (GPSLatitudeRef) {
          cloudlatOfPhoto = GPSLatitude.split("").join('').split("/100").join('').split("/1").join('').split(", ");
          cloudlongOfPhoto = GPSLongitude.split("").join('').split("/100").join('').split("/1").join('').split(", ");
          if (GPSLatitudeRef === "S") {
            let latDegres = parseFloat(cloudlatOfPhoto[0]);
            let latMinute = parseFloat(cloudlatOfPhoto[1] / 60);
            let latSecond = parseFloat(cloudlatOfPhoto[2] / 360000);
            cloudlatOfPhoto = -(latDegres + latMinute + latSecond);
          }
          if (GPSLatitudeRef === "N") {
            let latDegres = parseFloat(cloudlatOfPhoto[0]);
            let latMinute = parseFloat(cloudlatOfPhoto[1] / 60);
            let latSecond = parseFloat(cloudlatOfPhoto[2] / 360000);
            cloudlatOfPhoto = (latDegres + latMinute + latSecond);
          } 
          if (GPSLongitudeRef === "W") {
            let latDegres = parseFloat(cloudlongOfPhoto[0]);
            let latMinute = parseFloat(cloudlongOfPhoto[1] / 60);
            let latSecond = parseFloat(cloudlongOfPhoto[2] / 360000);
            cloudlongOfPhoto = -(latDegres + latMinute + latSecond);
          }
          if (GPSLongitudeRef === "E") {
            let latDegres = parseFloat(cloudlongOfPhoto[0]);
            let latMinute = parseFloat(cloudlongOfPhoto[1] / 60);
            let latSecond = parseFloat(cloudlongOfPhoto[2] / 360000);
            cloudlongOfPhoto = (latDegres + latMinute + latSecond);
          }
        }
        const newReport = new Reports({
          owner_ID: req.user._id,
          location: {name: category, type: "Point", coordinates: [cloudlatOfPhoto,cloudlongOfPhoto]},
          address: {
            street,
            number,
            city,
            userlat: 00,                          /* user_location.lat  -------FUTURA IMPLEMENTAÇÃO*/
            userlong: 00,                         /* user_location.long -------FUTURA IMPLEMENTAÇÃO*/
            latOfStreet: 00,                      /* geolatOfStreet     -------FUTURA IMPLEMENTAÇÃO*/
            longOfStreet: 00,                     /* geologOfStreet     -------FUTURA IMPLEMENTAÇÃO*/
            latOfPhoto: cloudlatOfPhoto,
            longOfPhoto: cloudlongOfPhoto,
          },
          category,
          picture,
          description
        });
        newReport
          .save()
          .then(() => {
            res.redirect("/dashboard");
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
    });

//! PRIVATE ROUTES ====  END  ====

/* LOGOUT */
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;




// => TEST IF IT IS A REAL ADDRESS

//     =============== FUTURA IMPLEMENTAÇÃO ======================

//         const geocoder = new google.maps.Geocoder();
//         if (street) {
//           street.addEventListener('focusout', function () {
//             geocodeAddress(geocoder);
//           });
//         }
//         function geocodeAddress(geocoder) {
//           let address = street;
//           geocoder.geocode({ 'address': address }, function (results, status) {
//             if (status === 'OK') {
//               // FIND LAT and LONG OF STREET
//               const geolatOfStreet = results[0].geometry.location.lat();
//               const geologOfStreet = results[0].geometry.location.lng();
//             } else {
//               alert('Digite um endereço válido');
//             }
//           });
//         }

//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(function (position) {
//             const user_location = {
//               lat: position.coords.latitude,
//               lng: position.coords.longitude
//             };
//           }, function () {
//             console.log('Error in the geolocation service.');
//           });
//         } else {
//           console.log('Browser does not support geolocation.');
//         }})