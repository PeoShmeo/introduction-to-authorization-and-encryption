//jshint esversion:6

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// ! Sets up the session with some configuration
app.use(
    session({
        secret: 'Our little secret.',
        resave: false,
        saveUninitialized: false,
    })
);

// ! Sets up passport, and uses passport to deal with the sessions
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// ! Adds passport plugin to the user Schema. This hashes and salts passwords, and saves them into the mongoDB
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

// ! Allows passport to create sessions (cookies containing the information) and crumble sessions (use the information within cookies and destroy cookie)
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/logout', function (req, res) {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
    });
    res.redirect('/');
});

// ! If the user is authenticated, then it renders the secrets page, else, it redirects to login
app.get('/secrets', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.post('/register', function (req, res) {
    User.register(
        { username: req.body.username },
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.redirect('/register');
            } else {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/secrets');
                });
            }
        }
    );
});

app.post("/login", passport.authenticate("local"), function(req, res){
    res.redirect("/secrets");
});

// app.post('/login', function (req, res) {
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password,
//     });

//     req.login(user, function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             passport.authenticate('local')(req, res, function () {
//                 res.redirect('/secrets');
//             });
//         }
//     });
// });

app.listen(3000, () => {
    console.log('Successfully started server on PORT 3000!');
});
