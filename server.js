require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var moment = require('moment-timezone');
var bcrypt = require('bcrypt');
var path = require('path');
var zipcodes = require('zipcodes');
var moment = require('moment');
var _ = require('lodash');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;


// Include envfile 
var envfile = require('envfile')
var sourcePath = 'file.env'
var sourceString = "a=1\nb:2"
var sourceObject = { a: 1, b: 2 }


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
    // var MONGODBURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forumProj'
var app = express();

// mongoose.connect(MONGODBURI);
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(methodOverride('_method'));

app.use(session({
    secret: "beagle",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));
app.use(bodyParser.json());



// app.get('/analytics', function(req, res) {
//     // res.sendFile(path.resolve(__dirname + '/public/index.html'));

//     authClient.authorize(function(err, tokens) {
//         if (err) {
//             // console.log(err);
//             return;
//         }

//         analytics.data.ga.get({
//             auth: authClient,
//             'ids': 'ga:119753868',
//             'start-date': '30daysAgo',
//             'end-date': 'yesterday',
//             'metrics': 'ga:visits'
//         }, function(err, data) {
//             // console.log(err);
//             // console.log(data);
//             res.send(data)
//         });


//         analytics.data.ga.get({
//             auth: authClient,
//             'ids': 'ga:119753868',
//             'start-date': '30daysAgo',
//             'end-date': 'yesterday',
//             'metrics': 'ga:avgSessionDuration'
//         }, function(err, data) {
//             // console.log(err);
//             // console.log(data);
//             res.send(data)
//         });


//     });

// })

app.get('/analytics', function(req, res) {
    // ar express = require(
    var wordpressPosts = require('wordpress-posts');
    var wordpressSiteUrl = "http://codedoll.com/";
    var posts = 4;

    wordpressPosts.get(wordpressSiteUrl, posts, function(err, data) {
        // console.log(data);
    });

    var google = require('googleapis');
    var OAuth2 = google.auth.OAuth2;

    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

    authClient.authorize(function(err, tokens) {
        console.log(tokens.access_token);
        res.send(tokens.access_token)

    });



    // authClient.authorize(function(err, tokens) {
    //     if (err) {
    //         // console.log(err);
    //         return;
    //     }

    //     analytics.data.ga.get({
    //         auth: authClient,
    //         'ids': 'ga:119753868',
    //         'start-date': '30daysAgo',
    //         'end-date': 'yesterday',
    //         'metrics': 'ga:visits'
    //     }, function(err, data) {
    //         // console.log(err);
    //         // console.log(data);
    //         res.send(data)
    //     });


    //     analytics.data.ga.get({
    //         auth: authClient,
    //         'ids': 'ga:119753868',
    //         'start-date': '30daysAgo',
    //         'end-date': 'yesterday',
    //         'metrics': 'ga:avgSessionDuration'
    //     }, function(err, data2) {
    //         // console.log(err);
    //         // console.log(data);
    //         res.send(data2)
    //     });


    // });



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


mongoose.connection.once('open', function() {
    console.log('connected to mongod');
})


app.listen(port, function() {
    console.log('listening');
})
