const express= require('express');
const app=express();
const { DBConnection } = require("./database/db.js");
const User =require('./models/User.js');
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


DBConnection();
app.get("/", (req,res)=>{
    res.send("Welcome !, I'm Live");
});

app.post("/register",async (req,res)=>{
    req.body;
    try{
        //get all the data
        const {firstname, lastname, email, password} = req.body;

        //check whether all the data exist
        if(!(firstname && lastname && email && password)){
            return res.status(400).send("Please enter all the details");
        }
        //check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).send("User already exists!");
        }
        //encrypt password
        const hashedPassword = await bcrypt.hashSync(password, 10);
        //save the user
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        //generate and send token
        const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        user.token = token;
        user.password = undefined;
        res
            .status(200)
            .json({ message: "You have successfully registered!", user });
    } 
    
    catch(error){
        console.error(error);
    }
});
app.listen(8000,()=>{
    console.log("Server is running on 8000");
})


