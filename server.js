require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// var session = require('express-session');
var moment = require('moment-timezone');
var bcrypt = require('bcrypt');
var path = require('path');
var zipcodes = require('zipcodes');
var moment = require('moment');
var session = require('client-sessions');
var _ = require('lodash');
var httpRequest = require('fd-http-request');


var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var Clothing = require('./models/clothing_model.js');
var User = require('./models/user_model.js');
var app = express();

app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));
// Include envfile 
// var envfile = require('envfile')
// var sourcePath = 'file.env'
// var sourceString = "a=1\nb:2"
// var sourceObject = { a: 1, b: 2 }

console.log(session.sessionID);

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.ANALYTICS_SECRET;
var REDIRECT_URL = "http://localhost:4000/oauth2callback";

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
    'https://www.googleapis.com/auth/analytics.readonly'
];

var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes // If you only need one scope you can pass it as string
});



// var googleapis = require('googleapis');
var googleAuth = require('google-auth-library');
var fs = require('fs');

var googleapis = require('googleapis'),
    JWT = googleapis.auth.JWT,
    analytics = googleapis.analytics('v3');

var SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL;
var SERVICE_ACCOUNT_KEY_FILE = __dirname + '/client_secret.json';

var authClient = new JWT(
    SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_KEY_FILE,
    null, ['https://www.googleapis.com/auth/analytics.readonly']
);

var port = process.env.PORT || 4000
var MONGODBURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/outfitforme'

mongoose.connect(MONGODBURI);
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(methodOverride('_method'));

// app.use(session({
//     cookieName: 'session',
//     secret: 'beagle',
//     resave: false,
//     saveUninitialized: true
// }));




// console.log(session);

app.use(express.static('public'));
app.use(bodyParser.json());


// LOGIN ROUTE
app.post('/userlogin', function(req, res) {

    User.findOne({ "username": req.body.username }, function(err, user) {
        // console.log(user);
        if (user == null) {
            // console.log("no user found");
            res.send({ user: "INVALID" })
        } else if (user.username === req.body.username) {
            // sets a cookie with the user's info

            if (bcrypt.compareSync(req.body.password, user.password)) {
                console.log("Login success");
                // console.log(session);
                req.session.user = user
                req.session.username = user.username

                res.send({
                    sessionID: req.session.username
                });

            } else {
                console.log("wrong password");
                // console.log(user);
                res.send("wrong password")
            }

        }
    });

});

// end login route


// USER LOGOUT DESTROY SESSION
app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');

});
// end USER LOGOUT DESTROY SESSION




// REQ.SESSION.USERNAME CHECKER
app.get('/sessionchecker', function(req, res) {
    // console.log(session);
    if (req.session && req.session.user) {
        User.findOne({ "username": req.session.username }, function(err, user) {
            // console.log(user);
            res.locals.user = user;
            res.send(user.username)
        });
    }
});



app.get('/forecast', function(req, res) {
    var ForecastIO = require('forecast-io')
    var forecast = new ForecastIO(process.env.DARKSKY)

    forecast
        .latitude('37.8267') //required: latitude, string.
        .longitude('-122.423') // required: longitude, string.
        .time('2016-07-30') // optional: date, string 'YYYY-MM-DD'.
        .units('auto') // optional: units, string, refer to API documentation.
        .language('en') // optional: language, string, refer to API documentation.
        .exclude('minutely,daily') // optional: exclude, string, refer to API documentation.
        .extendHourly(true) // optional: extend, boolean, refer to API documentation.
        .get() // execute your get request.
        .then(function(data) { // handle your success response.
            res.send(data)
        })
        .catch(err => { // handle your error response.
            console.log(err)
        })

});


app.get('/forecast/:id', function(req, res) {
    res.header("Content-Type", "application/json");

    var location = zipcodes.lookup(req.params.id);

    var ForecastIO = require('forecast-io')
    var forecast = new ForecastIO(process.env.DARKSKY)

    // httpRequest.get('https://api.gilt.com/v1/products?q=summer+dress&store=women&apikey=4f98486dc17f0323eb0a1c474784cfa025625669f94b331998e68fe6b82bd987', function(res){
    // console.log( res );
    // });

    forecast
        .latitude(location.latitude.toString()) //required: latitude, string.
        .longitude(location.longitude.toString()) // required: longitude, string.
        .time(moment().format('YYYY-MM-DD')) // optional: date, string 'YYYY-MM-DD'.
        .units('auto') // optional: units, string, refer to API documentation.
        .language('en') // optional: language, string, refer to API documentation.
        .exclude('minutely,daily') // optional: exclude, string, refer to API documentation.
        .extendHourly(true) // optional: extend, boolean, refer to API documentation.
        .get() // execute your get request.
        .then(function(data) { // handle your success response.

            var parseData = JSON.parse(data); //Parses the results from string to an obj
            res.send((_.merge(location, parseData)))
        })
        .catch(err => { // handle your error response.
            console.log(err)
        })




});


app.get('/clothing', function(req, res) {
    Clothing.find(function(err, data) {
        // console.log(data);
        res.send(data)
    });
})


// CREATES THE CLOTHING
app.post('/clothingAdd', function(req, res) {
    Clothing.create(req.body, function(err, data) {
        res.redirect("/")

    })

});
// end create clothing


// CREATES THE USER
app.post('/usersignup', function(req, res) {
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    // console.log(req.body.password);

    User.create(req.body, function(err, data) {
        req.session.sessionID = req.body.username;
        res.redirect("/")
    })
});
// end create user





// DELETES THE CLOTHING
app.delete('/clothingDelete', function(req, res) {
    Clothing.findByIdAndRemove(req.body.clothing._id, function(err, data) {
        res.send(data)
    })
});
// end delete clothing


// EDIT EXISTING CLOTHING
app.put('/edit/:id', function(req, res) {
    console.log(req.body);
    Clothing.findByIdAndUpdate(req.params.id, req.body, function(err, clothing) {
        console.log(clothing);
        res.send(clothing);
    });
});
// end edit existing clothing


app.get('*', function(req, res) {
    res.redirect('/');
});


mongoose.connection.once('open', function() {
    console.log('connected to mongod');
})


app.listen(port, function() {
    console.log('listening');
})
