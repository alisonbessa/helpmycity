require('dotenv').config()

const express       = require('express');
const hbs           = require('hbs');
const app           = express();
const path          = require('path');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');
//const uploadCloud   = require('../config/cloudinary');


mongoose
.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
.catch(err => console.error('Error connecting to mongo', err));


// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(__dirname + '/views/partials');

const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth');
app.use('/auth', auth);

const newReport = require('./routes/new-report');
app.use('/new-report', newReport);



app.listen(3000);