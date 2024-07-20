const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

// Helper function
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Register
router.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password, isAdmin } = req.body;

        if (!(firstname && lastname && email && password)) {
            return res.status(400).send("Please enter all the details");
        }

        if (!validateEmail(email)) {
            return res.status(400).send("Please enter a valid email address");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).send("User already exists!");
        }

        const hashedPassword = await bcrypt.hashSync(password, 10);
        const role = isAdmin ? 'admin' : 'user';

        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role
        });

        const token = jwt.sign({ id: user._id, email, role }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        user.token = token;
        user.password = undefined;
        res.status(200).json({ message: "You have successfully registered!", user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User not found!");
        }

        const enteredPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!enteredPasswordCorrect) {
            return res.status(401).send("Password is incorrect");
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        user.password = undefined;

        // Log the login activity
        await logActivity(user._id, 'login', { ip: req.ip });

        res.status(200).json({
            message: "You have successfully logged in!",
            success: true,
            token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            },
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;