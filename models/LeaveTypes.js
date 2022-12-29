const mongoose = require("mongoose");
const LeaveTypeSchema = new mongoose.Schema({
    leaveType: {
        type: String,
        required: true,
    },
    numberLeave: {
        type: Number,
        required: true,
    },
});

module.exports = leavetype = mongoose.model("leavetype", LeaveTypeSchema);