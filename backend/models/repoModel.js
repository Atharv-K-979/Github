
const mongoose = require("mongoose");
const { Schema } = mongoose;
// console.log("LOADING repo MODEL FILE");
const UserSchema = new Schema(
    {
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
            required: true,
        },
        repos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Repository",
            },
        ],
        starredRepos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Repository",
            },
        ],
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);
// console.log("Closing repo MODEL FILE");
module.exports = mongoose.model("User", UserSchema);
