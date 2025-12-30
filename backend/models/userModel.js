const mongoose = require("mongoose");
const { Schema } = mongoose;
// console.log("LOADING user MODEL FILE")
const UserSchema = new Schema({
    // timestamps: true,
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    repositories: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository",
        },
    ],
    followedUsers: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    starRepos: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository",
        },
    ],
},{
    timestamps: true,
});
// console.log("closing user MODEL FILE")
// const User = mongoose.model("User", UserSchema);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;