const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// app.use(bodyParser.urlencoded({extended:true}));

const User = require('../models/user');
const router = express.Router();

router.post('/signup', (req, res, next) => {
    console.log(req.body, 'New register');
    const {name, email, password } = req.body;

    // User verificação
    
    User.create({name, email, password })
    .then((user) => {
        res.redirect('/login')

    })
    .catch((error) => console.log(error)
    )

    res.render('signup');
});

router.post("/login", (req, res, next) => {
    const theUsername = req.body.username;
    const thePassword = req.body.password;
  
    // if (theUsername === "" || thePassword === "") {
    //   res.render("auth/login", {
    //     errorMessage: "Please enter both, username and password to sign up."
    //   });
    //   return;
    // }
  
    User.findOne({ "username": theUsername })
    .then(user => {
        if (!user) {
          res.render("auth/login", {
            errorMessage: "The username doesn't exist."
          });
          return;
        }
        //if (bcrypt.compareSync(thePassword, user.password)) {
        if (thePassword === user.password) {
          // Save the login in the session!
          req.session.currentUser = user;
          res.redirect("/dashboard");
        } else {
          res.render("", {
            errorMessage: "Incorrect password"
          });
        }
    })
    .catch(error => {
      next(error);
    })
  });

module.exports = router;