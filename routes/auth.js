const express     = require('express');
const User        = require('../models/user');
const Report      = require('../models/reports');
const Reports     = require('../models/reports');
const uploadCloud = require('../config/cloudinary');
const passport    = require("passport");
const flash       = require('connect-flash');
const cloudinary  = require("cloudinary").v2.api


const ensureLogin = require("connect-ensure-login");
// const localStrategy = require('passport-local').Strategy;

const router = express.Router();

// BCRYPT TO ENCRYPT PASSWORDS
const bcrypt = require('bcrypt');
const bcryptSalt = 10;


// SIGNUP ROUTE
router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  const { name, email, password } = req.body;

  if (email === '' || password === '' || name === '') {
    res.render('signup', {
      message: 'Por favor insira o nome do usuário, um e-mail e senha'
    });
  }

  // SIGNUP - User verification
  User.findOne({ email })
    .then(user => {
      if (user !== null) {
        res.render('signup', { message: 'O e-mail já está cadastrado' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        name,
        email,
        password: hashPass
      });

      newUser.save((err) => {
        if (err) {
          res.render('signup', {
            message: 'Não foi possível efetivar o cadastro'
          });
        } else {
          res.redirect('/login');
        }
      });
      res.render('login');
    });
});

// SIGN IN ROUTE ============> TESTAR
router.get("/login", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  } else {
    return res.render("login", {
    message: req.flash('error')
  });
}
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }
}

router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true,
  }
));

// ALLREPORTS ROUTE
router.get('/allreports', (req, res, next) => {
  Report.find().sort({ category: 1 })
    .then(reports =>
      res.render('allreports', { reports })
    )
}
);

router.post('/allreports', (req, res, next) => {
  Reports.find({ category: req.body.category })
    .then(reports => {
      if (reports.length > 0) {
        res.render('allreports', { reports })
        return;
      } else {
        req.flash("error", "");
        res.render('allreports',{message: req.flash("error") });
        return;
      }
      // res.send(reports)
    })
    .catch(error => console.log(error))
})


// DETAILS ROUTE
router.get('/details/:id', (req, res) => {
  const { id } = req.params;

  Report.findById(id)
    .then(report => {
      res.render('details', { report });
    })
    .catch(error => next(error))
});


//! PRIVATE ROUTES ==== START ====

// DASHBOARD ROUTE
router.get('/dashboard', ensureAuthenticated, (req, res, next) => {
  Report.find({ owner_ID: req.user._id }).sort({ category: 1 })
    .then(reports =>
      res.render('dashboard', { user: req.user, reports })
    )
}
);


// EDIT ROUTE - GET
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;

  Report.findById(id)
    .then(report => {
      res.render('edit', { report });
    })
    .catch(error => next(error))
});

// EDIT ROUTE - POST
router.post('/edit/:id', ensureAuthenticated, (req, res, next) => {
  console.log(req.body)
  const { id } = req.params;
  const { street, number, city, category, description } = req.body;
  const newReport = {
    address: {
      street,
      number,
      city,
    },
    category,
    description,
  }
  Report.findByIdAndUpdate(id, newReport)
    .then(_ => res.redirect('/dashboard'))
    .catch(error => next(error))
});


router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;

  Report.findById(id)
    .then(report => {
      res.render('edit', { report });
    })
    .catch(error => next(error))
});


router.get('/delete-report/:id', ensureAuthenticated, (req, res, next) => {
  const { id } = req.params;
  Report.findByIdAndDelete(id)
    .then(del => {
      res.redirect('/dashboard');
    })
    .catch(error => next(error))
});

// NEW REPORT ROUTE

router.get('/new-report', ensureAuthenticated, (req, res, next) => {
  res.render('new-report');
});

router.post('/new-report', [ensureAuthenticated, uploadCloud.single('picture')], (req, res, next) => {
  const { street, number, city, category, description } = req.body;
  const picture = req.file.url;

  // console.log("OLHHHAAAAAAAA FOOOOOOOTTTTOOOOOOOO CARAAIIIIIIIOOOOOOOOOOOOOOOOOOOOOOOOO ZZZZZZZZZZZZZZZZZ",req.file);
  // console.log("EXIFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",req.file.exif);

  //=> TEST IF IT IS A REAL ADDRESS
  /* =============== FUTURA IMPLEMENTAÇÃO ======================

  const geocoder = new google.maps.Geocoder();
  if (street) {
    street.addEventListener('focusout', function () {
      geocodeAddress(geocoder);
    });
  }
  function geocodeAddress(geocoder) {
    let address = street;
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status === 'OK') {
        // FIND LAT and LONG OF STREET
        const geolatOfStreet = results[0].geometry.location.lat();
        const geologOfStreet = results[0].geometry.location.lng();
      } else {
        alert('Digite um endereço válido');
      }
    });
  }


  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const user_location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    }, function () {
      console.log('Error in the geolocation service.');
    });
  } else {
    console.log('Browser does not support geolocation.');
  }













   */

  let cloudlatOfPhoto   = 00;
  let cloudlongOfPhoto  = 00;


  cloudinary.resource(req.file.public_id, {exif:true})
  .then(response => {
    const {
      GPSLatitude,
      GPSLatitudeRef,
      GPSLongitude,
      GPSLongitudeRef
    } = response.exif;
    const convertDegreesToLatLong = (lat, latDirection, long, longDirection) => {
      const [latDegrees, latMin, latSecs] = lat.split(',').join('').split('/1');
      const [longDegrees, longMin, longSecs] = long.split(',').join('').split('/1');
      if (GPSLatitudeRef === 'S') {
        cloudlatOfPhoto = (-(+latDegrees + +latMin / 60 + +latSecs / 3600));
      } else if (GPSLatitudeRef === 'N') {
        cloudlatOfPhoto = ((+latDegrees + +latMin / 60 + +latSecs / 3600));
      } else if (GPSLongitudeRef === 'W') {
        cloudlongOfPhoto = (-(+longDegrees + +longMin / 60 + +longSecs / 3600));
      } else if (GPSLongitudeRef === 'E') {
        cloudlongOfPhoto = ((+longDegrees + +longMin / 60 + +longSecs / 3600));
      } else {
        return [-(+latDegrees + +latMin / 60 + +latSecs / 3600), -(+longDegrees + +longMin / 60 + +longSecs / 3600)]
      }
    }
  })
  .catch(error => next(error))
/* 
  GPSLatitude: '23/1, 33/1, 42/1',
  GPSLatitudeRef: 'S',
  GPSLongitude: '46/1, 39/1, 37/1',
  GPSLongitudeRef: 'W', */

  const newReport = new Reports({
    owner_ID: req.user._id,
    location: {
      street,
      number,
      city,
      userlat: 00/* user_location.lat  ------------FUTURA IMPLEMENTAÇÃO*/,
      userlong: 00/* user_location.long -----------FUTURA IMPLEMENTAÇÃO*/,
      latOfStreet: 00/* geolatOfStreet --------FUTURA IMPLEMENTAÇÃO*/,
      longOfStreet: 00/* geologOfStreet -------FUTURA IMPLEMENTAÇÃO*/,
      latOfPhoto: cloudlatOfPhoto,
      longOfPhoto: cloudlongOfPhoto,
    },
    category,
    picture,
    description,
  })
  newReport.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch(error => {
      console.log(error);
    })


})

//! PRIVATE ROUTES ====  END  ====

/* LOGOUT */
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
















/* 

const {
GPSL
GPSLAREF
GPS
GPS
} = respo

const convetv






{

public_id: 'Help-My-City/20200116_153022.jpg',
  format: 'jpg',
  version: 1579199625,
  resource_type: 'image',
  type: 'upload',
  created_at: '2020-01-16T18:33:45Z',
  bytes: 2955942,
  width: 2268,
  height: 4032,
  url: 'http://res.cloudinary.com/dnc7dgbfc/image/upload/v1579199625/Help-My-City/20200116_153022.jpg.jpg(Not automatically expanded because 3 MB is too large. You can expand it anyway or open it in a new window.)',
  secure_url: 'https://res.cloudinary.com/dnc7dgbfc/image/upload/v1579199625/Help-My-City/20200116_153022.jpg.jpg(Not automatically expanded because 3 MB is too large. You can expand it anyway or open it in a new window.)',
  next_cursor: '95f755fb2ea4dae77349e799d668baee62341928fa0b6999d5586e8f28d807b8',
  derived: [{
      transformation: 't_media_lib_thumb',
      format: 'jpg',
      bytes: 1837,
      id: '05b8059c0518774df630d89ff22f3540',
      url: 'http://res.cloudinary.com/dnc7dgbfc/image/upload/t_media_lib_thumb/v1579199625/Help-My-City/20200116_153022.jpg.jpg(2 kB)
http://res.cloudinary.com/dnc7dgbfc/image/upload/t_media_lib_thumb/v1579199625/Help-My-City/20200116_153022.jpg.jpg
',
      secure_url: 'https://res.cloudinary.com/dnc7dgbfc/image/upload/t_media_lib_thumb/v1579199625/Help-My-City/20200116_153022.jpg.jpg(2 kB)
https://res.cloudinary.com/dnc7dgbfc/image/upload/t_media_lib_thumb/v1579199625/Help-My-City/20200116_153022.jpg.jpg
'
    }
  ],
  exif: {
    ApertureValue: '153/100',
    BrightnessValue: '-53/100',
    ColorSpace: '1',
    ComponentsConfiguration: '1, 2, 3, 0',
    Contrast: '0',
    DateTime: '2020:01:16 15:30:22',
    DateTimeDigitized: '2020:01:16 15:30:22',
    DateTimeOriginal: '2020:01:16 15:30:22',
    DigitalZoomRatio: '0/0',
    ExifOffset: '214',
    ExifVersion: '48, 50, 50, 48',
    ExposureBiasValue: '0/10',
    ExposureMode: '0',
    ExposureProgram: '2',
    ExposureTime: '1/60',
    Flash: '0',
    FlashPixVersion: '48, 49, 48, 48',
    FNumber: '17/10',
    FocalLength: '430/100',
    FocalLengthIn35mmFilm: '26',
    GPSAltitude: '818/1',
    GPSAltitudeRef: '0',
    GPSDateStamp: '2020:01:16',
    GPSInfo: '950',
    GPSLatitude: '23/1, 33/1, 42/1',
    GPSLatitudeRef: 'S',
    GPSLongitude: '46/1, 39/1, 37/1',
    GPSLongitudeRef: 'W',
    GPSTimeStamp: '18/1, 30/1, 19/1',
    GPSVersionID: '2, 2, 0, 0',
    ImageUniqueID: 'G12LLKA02SM G12LLKL01GM.',
    InteroperabilityOffset: '920',
    Make: 'samsung',
    MakerNote: '7, 0, 1, 0, 7, 0, 4, 0, 0, 0, 48, 49, 48, 48, 2, 0, 4, 0, 1, 0, 0, 0, 0, 32, 1, 0, 12, 0, 4, 0, 1, 0, 0, 0, 0, 0, 0, 0, 16, 0, 5, 0, 1, 0, 0, 0, 90, 0, 0, 0, 64, 0, 4, 0, 1, 0, 0, 0, 0, 0, 0, 0, 80, 0, 4, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0',
    MaxApertureValue: '153/100',
    MeteringMode: '2',
    Model: 'SM-N950F',
    Orientation: '6',
    PhotographicSensitivity: '800',
    PixelXDimension: '4032',
    PixelYDimension: '2268',
    ResolutionUnit: '2',
    Saturation: '0',
    SceneCaptureType: '0',
    SceneType: '1, 0, 0, 0',
    Sharpness: '0',
    ShutterSpeedValue: '591/100',
    Software: 'N950FXXS8DSK5',
    SubSecTime: '0660',
    SubSecTimeDigitized: '0660',
    SubSecTimeOriginal: '0660',
    InteroperabilityIndex: 'R98',
    InteroperabilityVersion: '48, 49, 48, 48',
    UserComment: '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0',
    WhiteBalance: '0',
    XResolution: '72/1',
    YCbCrPositioning: '1',
    YResolution: '72/1'
  },
  pages: 1,
  usage: {},
  original_filename: 'file',
  etag: '15315f88bfe27ca138364ca89aa1dd83',
  rate_limit_allowed: 500,
  rate_limit_reset_at: 2020-01-16T21:00:00.000Z,
  rate_limit_remaining: 498










*/