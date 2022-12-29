const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const UserRequest = require('../models/UserRequest.js');
// @route   POST /userRequest
// @desc    userRequest
// @access  Private
router.post(
  '/request',
  [
    check('leaveDate', 'Date is required').not().isEmpty(),
    check('leaveCategory', 'Category is required').not().isEmpty(),
    check('leaveDescription', 'leaveCategory is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = req.body;
    const leaveDate = req.body.leaveDate;
    const userid = req.body.userid;

    const newUser = new UserRequest(user);
    try {
      let user = await UserRequest.findOne({ leaveDate, userid });

      if (user) {
        res
          .status(409)
          .json({ errors: [{ msg: 'Request is already send on this date' }] });
      } else {
        await newUser.save();
        res.status(201).json(newUser);
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  }
);
router.patch('/notification/request', async (req, res) => {
  try {
    await UserRequest.updateMany({}, { $set: { view: true } });
    res.json('success');
  } catch (error) {
    res.json({ message: error.message });
  }
});
// @route   get /userRequest
// @desc    Get all
// @access  Private
router.get('/request', async (req, res) => {
  try {
    let userReq = await UserRequest.find();
    res.json(userReq);
  } catch (error) {
    res.json({ message: error.message });
  }
});
router.get('/request/api', async (req, res) => {
  try {
    let userReq = await UserRequest.find({ status: req.query.status });
    res.json(userReq);
  } catch (error) {
    res.json({ message: error.message });
  }
});
// @route   get by id /userRequest
// @desc    Get Login user
// @access  Private

router.get('/request/:id', async (req, res) => {
  // const id = req.params.id;
  try {
    const userReq = await UserRequest.findById({ _id: req.params.id });
    res.json(userReq);
  } catch (error) {
    res.json({ message: error.message });
  }
});
// @route   get by userid /userRequest
// @desc    Get Login user
// @access  Private
router.get('/request/userleave/:id', async (req, res) => {
  // const userid = req.body.userid
  try {
    const userReq = await UserRequest.find({ userid: req.params.id });
    res.json(userReq);
  } catch (error) {
    res.json({ message: error.message });
  }
});
// @route   get Group by/userRequest
// @desc    Get Group user levae
// @access  Private
router.get('/request/usercount/:id', async (req, res) => {
  // const userid = req.body.userid
  try {
    const pipeline = [
      {
        $match: {
          userid: req.params.id,
          status: 'Granted',
        },
      },
      {
        $group: {
          _id: {
            status: '$status',
            leaveCategory: '$leaveCategory',
          },
          count: {
            $sum: 1,
          },
        },
      },
    ];
    const countleave = UserRequest.aggregate(pipeline);
    const arr = [];
    for await (const doc of countleave) {
      arr.push(doc);
    }
    res.status(200).json(arr);
  } catch (error) {
    res.json({ message: error.message });
  }
});
// @route   get by manager /userRequest
// @desc    manager
// @access  Private
router.get('/request/manageleave/:id', async (req, res) => {
  // const userid = req.body.userid
  try {
    const userReq = await UserRequest.find({ manager: req.params.id });
    res.json(userReq);
  } catch (error) {
    res.json({ message: error.message });
  }
});

// @route   Update /users/userRequest
// @desc    Get user by id
// @access  Private

router.patch('/request/:id', async (req, res) => {
  const user = req.body;
  const id = req.params.id;

  const editUser = new UserRequest(user);
  try {
    await UserRequest.updateOne({ _id: id }, editUser);
    res.json(editUser);
  } catch (error) {
    res.json({ message: error.message });
  }
});

// @route   Delete /User Request
// @desc    Get user by id
// @access  Private
router.delete('/request/:id', async (req, res) => {
  try {
    await UserRequest.deleteOne({ _id: req.params.id });
    res.json('User Deleted Successfully');
  } catch (error) {
    res.json({ message: error.message });
  }
});
module.exports = router;
