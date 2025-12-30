const mongoose = require("mongoose");
const { Schema } = mongoose;
// console.log("LOADING issue MODEL FILE")
const IssueSchema = new Schema({
    // timestamps: true,
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    repository: {
        type: Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    },
},{
    timestamps: true,
});
// console.log("LOADING issue MODEL FILE")
const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;