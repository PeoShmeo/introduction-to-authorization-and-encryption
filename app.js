//jshint esversion:6

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const bcrypt = require('bcrypt');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// const encKey = process.env.KEYNAME;
// const sigKey = process.env.KEYNAME;
// const secret = process.env.SECRET_KEY;

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// userSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey });
// userSchema.plugin(encrypt, {
//     secret: secret,
//     encryptedFields: ['password'],
// });

const User = mongoose.model('User', userSchema);

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/register', function (req, res) {
    const email = req.body.username;
    const password = req.body.password;

    const user = new User({
        email: email,
        password: md5(password),
    });
    user.save((err) => {
        if (err) {
            console.log(err);
        } else {
            res.render('secrets');
        }
    });
});

app.post('/login', function (req, res) {
    const email = req.body.username;
    const password = req.body.password;
    const hashedPassword = md5(password);

    User.findOne({ email: email }, function (err, account) {
        if (err) {
            console.log(err);
        } else if (account && account.password === hashedPassword) {
            res.render('secrets');
        } else {
            console.log('Not valid account, Please try again!');
            res.render('login');
        }
    });
});

app.listen(3000, () => {
    console.log('Successfully started server on PORT 3000!');
});
