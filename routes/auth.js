const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const jwtSecret = require('../config/keys').jwtSecret;


// @route   POST /users
// @desc    Register user
// @access  Public
router.post(
    "/",
    [
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter password with 6 or more characters"
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { datepicker,
            employee,
            gender,
            firstname,
            lastname,
            department,
            position,
            address,
            phoneNo,
            email,
            password,
            manager,
            joinDate,
            role
        } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({ email });

            if (user) {
                res.status(400).json({ errors: [{ msg: "Email already exists" }] });
                res.end()
            } else {
                user = new User({
                    datepicker,
                    employee,
                    gender,
                    firstname,
                    lastname,
                    department,
                    position,
                    address,
                    phoneNo,
                    email,
                    password,
                    manager,
                    joinDate,
                    role
                });

                //Encrypt Password
                const salt = await bcrypt.genSalt(10);

                user.password = await bcrypt.hash(password, salt);

                await user.save();

                //Return jsonwebtoken
                const payload = {
                    user: {
                        id: user.id,
                    },
                };

                jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
                    if (err) throw err;
                    res.status(201).json({ token });

                });

            }

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);
// @route   POST /users
// @desc    Update Password user
// @access  Private
router.patch(
    "/",
    [
        check(
            "password",
            "Please enter password with 6 or more characters"
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { password, _id, role, currentPassword, email } = req.body;
        let user = await User.findOne({ email });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ errors: [{ msg: "Invalid Credentials" }] });
        } else {
            try {
                // See if user exists


                newuser = new User({
                    _id,
                    password,
                    role
                });

                //Encrypt Password
                const salt = await bcrypt.genSalt(10);

                newuser.password = await bcrypt.hash(password, salt);
                await User.updateOne({ _id: _id }, newuser)
                //Return jsonwebtoken
                const payload = {
                    user: {
                        id: newuser._id,
                    },
                };

                jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });

            } catch (err) {
                console.error(err.message);
                res.status(500).send("Server error");
            }
        }



    }
);
// @route   Update /User
// @desc    Get user by id
// @access  Private
router.patch('/:id', async (req, res) => {

    const employeeData = req.body;
    const editemployee = new User(employeeData);
    const id = req.params.id;
    try {
        await User.updateOne({ _id: id }, editemployee)
        res.json(editemployee)

    } catch (error) {
        res.json({ message: error.message })
    }
})
// @route   GET /users/auth
// @desc    Get user by token/ Loading user
// @access  Private
router.get("/auth", auth, async (req, res) => {
    try {
        const user = await User.findOne({ '_id': mongoose.Types.ObjectId(req.user.id) });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/authid", auth, async (req, res) => {
    try {
        const user = await User.findOne({ '_id': mongoose.Types.ObjectId(req.query.id) });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   GET /All user
// @desc    Get all
// @access  Private
router.get("/auth/alluser", auth, async (req, res) => {
    try {
        const user = await User.find({}).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
router.get("/auth/:id", auth, async (req, res) => {
    try {
        const user = await User.findOne({ '_id': mongoose.Types.ObjectId(req.params.id) });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// @route   POST /users/auth
// @desc    Authentication user & get token/ Login user
// @access  Public
router.post(
    "/auth",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            //Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(payload, jwtSecret, { expiresIn: "5 days" }, (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);
router.delete('/auth/:id', async (req, res) => {

    try {
        await User.deleteOne({ _id: req.params.id })
        res.json("User Deleted Successfully")

    } catch (error) {
        res.json({ message: error.message })
    }
})
module.exports = router;
