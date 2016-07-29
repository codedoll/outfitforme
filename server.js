var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var moment = require('moment');
var bcrypt = require('bcrypt');
var path = require('path');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = "721951980911-emhegsm8nem373s60qriuvnmbufcpkug.apps.googleusercontent.com";
var CLIENT_SECRET = "XmiwoVyzihPNnTVYb2Ny3oHr";
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

var SERVICE_ACCOUNT_EMAIL = 'outfitformeanalytics@appspot.gserviceaccount.com';
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



app.get('/analytics', function(req, res) {
    // res.sendFile(path.resolve(__dirname + '/public/index.html'));

    authClient.authorize(function(err, tokens) {
        if (err) {
            console.log(err);
            return;
        }

        analytics.data.ga.get({
            auth: authClient,
            'ids': 'ga:119753868',
            'start-date': '2015-01-19',
            'end-date': '2017-01-19',
            'metrics': 'ga:visits'
        }, function(err, data) {
            // console.log(err);
            // console.log(data);
            res.send(data)
        });


    });

})


app.get('/analytics2', function(req, res) {
            var google = require('googleapis');
            var OAuth2 = google.auth.OAuth2;

            var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

            authClient.authorize(function(err, tokens) {
                    console.log(tokens);
  					res.send(tokens)
                    })

                

            });



        mongoose.connection.once('open', function() {
            console.log('connected to mongod');
        })


        app.listen(port, function() {
            console.log('listening');
        })
