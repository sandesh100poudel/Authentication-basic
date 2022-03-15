//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
var session=require("express-session");
const passport = require("passport");
const passportLocalMongoose=require("passport-local-mongoose");




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
    "password":String
});


userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.get("/", (req,res)=>{
    res.render("home");
})

app.get("/register", (req,res)=>{
   
    res.render("register");
});

app.get("/login", (req,res)=>{
    res.render("login");
});

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
})







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