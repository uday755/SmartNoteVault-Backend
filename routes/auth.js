const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRouter = express.Router();
const { body, validationResult, buildCheckFunction } = require('express-validator');
const UserModel = require("../models/UserModel");
const JWT_SECRET = 'udayisagood@$boy';
const fetchUser = require("../middlewares/fetchUser");

// ROUTE : 1 :: Create a User Using POST Method on "/api/auth/createUser" . No Login is required
userRouter.post('/createUser', [
    body('name', 'Enter a Valid Name of Lenght at least 3').isLength({ min: 3 }),
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password Lenght should be atleast 5').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    // Validation Checks and Returning Bad request and the errors
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(400).send({success, errors: result.array() });
    }

    try {
        // Check weather the user with this email exixts already
        let user = await UserModel.findOne({ email: req.body.email });
        if (user) return res.status(400).json({success, error: "Sorry a User with this email already exists" })

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);


        // Creating a New User //
        user = await UserModel.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })

        const data = {
            user: { id: user.id }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // console.log("Token : " + authToken);
        success = true;
        res.json({ success, authToken })

        // res.json(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error Occured");
    }

})

// ROUTE : 2 :: Authenticate a User using : POST  "api/auth/login". No Login Required
userRouter.post("/login", [
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password can not be blank').exists()
], async (req, res) => {
    let success = false;
    // Validation Checks and Returning Bad request and the errors
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(400).send({ errors: result.array() });
    }

    // For valid email and non blank password
    const { email, password } = req.body;
    try {
        let user = await UserModel.findOne({ email }).exec();
        // If user does not exist
        if (!user) {
            success = false;
            return res.status(400).json({success, error: "Incorrect Credentials Entered" })
        }

        // If User exixt
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({success, error: "Incorrect Credentials Entered" })
        }

        // If Password matches
        const data = {
            user: { id: user.id }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        // console.log("Token : " + authToken);
        success = true;
        res.json({success, authToken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Inernal Server Error");
    }
})


// ROUTE 3 :: Get Logged-in User Details using :: POST "/api/auth/getUser" . Login Required
userRouter.post("/getUser", fetchUser,  async (req, res) => {
    try {
        const userID = req.user.id;
        const user = await UserModel.findById(userID).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = userRouter; 