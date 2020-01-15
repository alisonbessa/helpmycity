require('dotenv').config()

const express       = require('express');
const hbs           = require('hbs');
const app           = express();
const path          = require('path');
const mongoose      = require('mongoose');
const bodyParser    = require("body-parser");
const session       = require("express-session");
const MongoStore    = require("connect-mongo")(session);
const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash         = require("connect-flash");
const User          = require("./models/user");

// BCRYPT TO ENCRYPT PASSWORDS
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

mongoose
.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
.catch(err => console.error('Error connecting to mongo', err));

/* SESSION */
app.use(
  session({
    secret: "localAuthStrategy",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 // 1 day
    })
  })
);

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(__dirname + '/views/partials');
app.use(flash()); 

/* PASSPORT */
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
} , 
(username, password, next) => {
  User.findOne({ email: username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "E-mail não cadastrado ou senha incorreta" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "E-mail não cadastrado ou senha incorreta" });
    }

    return next(null, user);
  });
}));

app.use(passport.initialize()); 
app.use(passport.session());

const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth');
app.use('/', auth);

const newReport = require('./routes/new-report');
app.use('/new-report', newReport);

app.listen(process.env.PORT, console.log(`Listening on port ${process.env.PORT}`));
