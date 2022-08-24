require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
////to pass a secret string instead of two keys
// const secret = "Thisisourlittlesecret."
////use "plugin" method to use package as extension
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"]});
////after finish the encrypt, use the schema to create a model
const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne(
            {email: username},
            function(err, foundUser){
                if (err){
                    console.log(err);
                } else {
                    if (foundUser.password === password){
                        res.render("secrets");
                    }
                }
            }
        );
    });

app.route("/register")
    .get(function (req, res) {
        res.render("register");
    })
    .post(function (req, res) {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        newUser.save(function (err) {
            if (!err) {
                res.render("secrets");
            } else {
                res.send(err);
            }
        });
    });


app.listen(3000, function () {
    console.log("Server is running on port 3000.");
});