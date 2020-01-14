const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const User = require('../models/user');
const router = express.Router();

// app.use(bodyParser.urlencoded({extended:true}));

//! Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


/* SIGN UP ROUTE */

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  const {name, email, password } = req.body;
  console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
  
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
        res.redirect("/");
      }
    });
    res.render('signup');
});

// router.post("/login", (req, res, next) => {
//     const theEmail = req.body.email;
//     const thePassword = req.body.password;
  
//     User.findOne({ "email": theEmail })
//     .then(user => {
//         if (!user) {
//           res.render("auth/login", {
//             message: "E-mail não cadastrado ou senha incorreta"
//           });
//           return;
//         }
//         //! Password test
//         if (bcrypt.compareSync(thePassword, user.password)) {
//         if (thePassword === user.password) {

//           //TODO Save the login in the session!

//           req.session.currentUser = user;
//           res.redirect("/dashboard");
//         } else {
//           res.render("", {
//             message: "E-mail não cadastrado ou senha incorreta"
//           });
//         }
//       }
//     })
  //   .catch(error => {
  //     next(error);
  //   })
  // })
});

module.exports = router;