const express       = require('express');
const User          = require('../models/user');
const Report        = require('../models/reports');
const Reports       = require('../models/reports');
const uploadCloud   = require('../config/cloudinary');
const passport      = require("passport");

const ensureLogin   = require("connect-ensure-login");
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
  const {name, email, password } = req.body;
  
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
        res.redirect('login');
      }
    });
    res.render('login');
  });
});

// SIGN IN ROUTE ============> TESTAR
router.get("/login", (req, res, next) => {
  res.render("login",{
    message: req.flash('error')
  }); 
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
   Report.find().sort({category: 1})
   .then(reports =>
    res.render('allreports', { reports })
    )}
 );


// DETAILS ROUTE
router.get('/details/:id', (req, res) => {
 const { id } = req.params;
 
 Report.findById(id)
   .then(report => {
     res.render('details', {report});
   })
   .catch(error => next(error))
 });


 //! PRIVATE ROUTES ==== START ====
 
 // DASHBOARD ROUTE
 router.get('/dashboard', ensureAuthenticated, (req, res, next) => {
   Report.find({owner_ID: req.user._id}).sort({category: 1})
   .then(reports =>
    res.render('dashboard', {user: req.user, reports })
    )}
  );
  

// EDIT ROUTE - GET
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  
  Report.findById(id)
    .then(report => {
      res.render('edit', {report});
    })
    .catch(error => next(error))
  });

// EDIT ROUTE - POST
router.post('/edit/:id', ensureAuthenticated, (req, res, next) => {
  console.log(req.body)
  const { id } = req.params;
  const { street, number, city, category, description } = req.body;
  const newReport = {
    location: {
      street,
      number,
      city,
    },
    category,
    description,
  }

  Report.findByIdAndUpdate(id, newReport )
    .then(_ => res.redirect('/dashboard'))
    .catch(error => next(error))
  });


router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  
  Report.findById(id)
    .then(report => {
      res.render('edit', {report});
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

router.get('/new-report', ensureAuthenticated,(req, res, next) => {
  res.render('new-report');
});

router.post('/new-report', [ensureAuthenticated, uploadCloud.single('picture')], (req, res, next) => {
  const { street, number, city, category, description } = req.body;
  const picture = req.file.url;

  const newReport = new Reports({
      owner_ID: req.user._id,
      location: {
          street,
          number,
          city,
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

      
    },)
    
    //! PRIVATE ROUTES ====  END  ====

    /* LOGOUT */
    router.get("/logout", (req, res) => {
      req.logout();
      res.redirect("/");
    });

    module.exports = router;