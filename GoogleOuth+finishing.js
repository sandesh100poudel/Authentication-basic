//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
var session=require("express-session");
const passport = require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate");




const app=express();
// console.log(process.env.SECRETE);


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser:true} ,()=>{
    console.log("connected to mongodb");
});
// mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
    "email":String,
    "password":String,
    "googleId":String,
    "secret":String
});


userSchema.plugin(passportLocalMongoose);
//write this for google authentication


userSchema.plugin(findOrCreate);

const User=new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

//replacemenat of theat


passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    });
});

//thsi is for google authentication

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", (req,res)=>{
    res.render("home");
});

app.get("/auth/google",
    passport.authenticate("google",{scope:["profile"]}
    )
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/register", (req,res)=>{
   
    res.render("register");
});

app.get("/login", (req,res)=>{
    res.render("login");
});

app.get("/secrets",(req,res)=>{
    User.find({"secret":{$ne:null}},(err,foundUser)=>{
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                res.render("secrets",{userswithSecrets:foundUser})
            }
        }
    })
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

app.get("/submit",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }

});

app.post("/submit",(req,res)=>{
    const submittedSecret=req.body.secret;
    console.log(req.user.id);

    User.findById(req.user.id,(err,foundUser)=>{
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                foundUser.secret=submittedSecret;
                foundUser.save(()=>{
                    res.redirect("/secrets");
                });
            }
        }
    })


});







app.post("/register",(req, res)=>{
 
  User.register({username:req.body.username}, req.body.password,(err,user)=>{
      if(err){
          console.log(err)
      }else{
          passport.authenticate("local")(req,res,()=>{
              res.redirect("/secrets");
          });
      }
  })
});


app.post("/login", (req,res)=>{

    const user= new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    })
   
});


app.listen(3000,()=>{
    console.log("server is running");
})