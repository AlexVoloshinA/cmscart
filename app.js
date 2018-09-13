const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const {database} = require('./config/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileupload = require('express-fileupload');


//Connect to DB
mongoose.connect(database, {useNewUrlParser: true}).then(() => {
  console.log('Connected');
});

//Init app
const app = express();


//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Set Global Errors Variable
app.locals.errors = null;

//Express fileupload

app.use(fileupload());

//Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //cookie: {secure: true}
}));

//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value 
    };
  }
}));

//Express Messages middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
});


//Set routes
const pages = require('./routes/pages');
const adminpages = require('./routes/adminpages');
const categorypages = require('./routes/admincategories');
const adminProducts = require('./routes/adminproducts');

app.use('/', pages);
app.use('/admin/pages', adminpages);
app.use('/admin/categories', categorypages);
app.use('/admin/products', adminProducts);

var port = 3000;

app.listen(port, () => {
  console.log(`Server is running on the port ${port} .....` );
});