const express = require('express');
const User = require('../models/user');
const Report = require('../models/reports');

const router = express.Router();

//! Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


/* SIGN UP ROUTE */
router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  const {name, email, password } = req.body;
  
  if (email === "" || password === "" || name === "") {
    res.render("signup", {
      message: "Por favor insira o nome do usuário, um e-mail e senha"
    });
  }

  //! User verification


  User.findOne({ email })
  .then(user => {
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

    newUser.save((err) => {
      if (err) {
        res.render("signup", { message: "Não foi possível efetivar o cadastro" });
      } else {
        res.redirect("login");
      }
    });
    res.render('login');
  });
});

/* SIGN IN ROUTE */
router.get('/login', (req, res, next) => {
  res.render('login');
});


router.post("/login", (req, res, next) => {
  const theEmail = req.body.email;
  const thePassword = req.body.password;
  
  User.findOne({ "email": theEmail })
  .then(user => {
    if (!user) {
      res.render("auth/login", {
        message: "E-mail não cadastrado ou senha incorreta"
      });
      return;
    }
    //! Password test
    console.log(thePassword, user.password)
    if (bcrypt.compareSync(thePassword, user.password)) {    
        //TODO Save the login in the session!
        
        req.currentUser = user;
        res.redirect("/auth/dashboard");
        //! res.redirect("/dashboard");     <---------------------------------------------------------- Um ou outro?
      } else {
        res.render("", {
          message: "E-mail não cadastrado ou senha incorreta"
        });
      }
  })
  .catch(error => {
    next(error);
  })
})

/* DASHBOARD ROUTE */
router.get('/dashboard', (req, res, next) => {
  Report.find()
      .then(reports =>
          res.render('dashboard', {
              reports
      })
  )}
);

// GET reports edit form
router.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  
  Report.findById(id)
    .then(report => {
      res.render('edit', {report});
    })
    .catch(error => next(error))
});

// POST report edit
router.post('/edit/:id', (req, res, next) => {
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
    .then(_ => res.redirect('/auth/dashboard'))
    .catch(error => next(error))
});




router.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  
  Report.findById(id)
    .then(report => {
      res.render('edit', {report});
    })
    .catch(error => next(error))
});


router.get('/delete-report/:id', (req, res, next) => {
  const { id } = req.params;
  Report.findByIdAndDelete(id)
    .then(_ => {
      res.redirect('/auth/dashboard');
    })
    .catch(error => next(error))
});

module.exports = router;