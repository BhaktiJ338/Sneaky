require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB, {useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    googleId: String,
    facebookId: String,
    secret: Array
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, {
        id: user.id,
        username: user.username
        });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://sneaky-p7ed.onrender.com/auth/google/secrets'
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      // Find or create user in your database
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Create new user in database
        const username = Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value.split('@')[0] : '';
        const newUser = new User({
          username: profile.displayName,
          googleId: profile.id
        });
        user = await newUser.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://sneaky-p7ed.onrender.com/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get('/', (req, res)=>{
    res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect('/secrets');
});

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['profile'] })
);

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
    // Successful authentication, redirect to secrets
    res.redirect('/secrets');
});

app.get('/login', (req, res)=>{
    res.render("login");
});

app.get('/register', (req, res)=>{
    res.render("register");
});

app.get('/secrets', (req,res)=>{
    User.find({'secret': {$ne:null}}).then((foundUsers)=>{
        if(foundUsers){
            res.render('secrets', {usersWithSecret:foundUsers});
        }
    })
    .catch((err)=>{
        console.log(err);
    });
});

app.get('/submit', (req,res)=>{
    if(req.isAuthenticated()){
        res.render('submit');
    }
    else{
        res.redirect('/login');
    }
});

app.post("/submit", (req, res) => {
    User.findOneAndUpdate({_id: req.user.id}, {$push: { secret: req.body.secret }}).then(()=>{
        res.redirect("/secrets");
    })
    .catch((err)=>{
        console.log(err);
    })
});

app.get('/logout', (req,res)=>{
    req.logout((err)=>{
        if(err) console.log(err);
    });
    res.redirect('/');
});

app.post('/register', (req, res)=>{
    User.register({username:req.body.username}, req.body.password, (err, user)=>{
        if(err) {
            console.log(err);
            res.redirect('/register');
        }
        else{
            passport.authenticate("local") (req, res, ()=>{ //user authenticated successfully
                res.redirect('/secrets');
            });
        }
    });
});

app.post('/login', (req, res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err)=>{
        if(err) console.log(err);
        else {
            passport.authenticate("local") (req, res, ()=>{ //user authenticated successfully
                res.redirect('/secrets');
            });
        }
    });
});

app.listen(process.env.PORT, ()=>{
    console.log("Server started on port 3000");
});