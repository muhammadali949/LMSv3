const express = require("express");
const router = express.Router();
const leavetype = require("../models/LeaveTypes");
const { check, validationResult } = require("express-validator");

// @route   POST /LeaveTypes
// @desc    Leave Type and number
// @access  Private
router.post('/leave', [
    check("leaveType", "leaveType is required").not().isEmpty(),
    check("numberLeave", "numberLeave is required").not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const leave = req.body;
    const lType = req.body.leaveType;
    const newLeaveType = new leavetype(leave);
    try {
        let userLeave = await leavetype.findOne({ leaveType: lType });
        if (userLeave) {
            res.status(400).json({ errors: [{ msg: "This type already decleared" }] });
        } else {
            await newLeaveType.save()
            res.status(201).json(newLeaveType);
        }

    } catch (error) {
        res.json({ message: error.message })
    }
})
// @route   get /Leave
// @desc    Get all
// @access  Public
router.get('/leave', async (req, res) => {

    try {
        let LeaveAll = await leavetype.find()
        res.json(LeaveAll);
    } catch (error) {
        res.json({ message: error.message })
    }
})
// @route   GET /Leave
// @desc    Get leave by id
// @access  Private
router.get("/leave/:id", async (req, res) => {
    try {
        const leave = await leavetype.findById({ _id: req.params.id });
        res.json(leave);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


// @route   Update /Leave
// @desc    Get user by id
// @access  Private
router.patch('/leave/:id', async (req, res) => {

    const leaveData = req.body;
    const editLeave = new leavetype(leaveData);
    const id = req.params.id;
    try {
        await leavetype.updateOne({ _id: id }, editLeave)
        res.json(editLeave)

    } catch (error) {
        res.json({ message: error.message })
    }
})
// @route   Delete /Leave
// @desc    Get user by id
// @access  Private
router.delete('/leave/:id', async (req, res) => {

    try {
        await leavetype.deleteOne({ _id: req.params.id })
        res.json("User Deleted Successfully")

    } catch (error) {
        res.json({ message: error.message })
    }
})


module.exports = router;
