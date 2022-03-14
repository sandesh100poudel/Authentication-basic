//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");



const app=express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser:true} ,()=>{
    console.log("connected to mongodb");
});

const userSchema ={
    "email":String,
    "password":String
};

const User=new mongoose.model("User", userSchema);



app.get("/", (req,res)=>{
    res.render("home");
})

app.get("/register", (req,res)=>{
    res.render("register");
});

app.get("/login", (req,res)=>{
    res.render("login");
});







app.post("/register",(req, res)=>{
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });

    newUser.save((err)=>{
        if(err){
            console.log(error)
        }else{
            res.render("secrets");
        }
    })
});


app.post("/login", (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({email:username},(err,foundUser)=>{
        if(err){
            console.log(err);
        
        }else{
            if (foundUser){
                if(foundUser.password===password){
                    res.render("secrets");
                }else{
                    res.send("incorrect password of email , try once again");
                }
            }
        }
    });
});


app.listen(3000,()=>{
    console.log("server is running");
})