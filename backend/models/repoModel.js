// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const RepositorySchema = new Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//             unique: true,
//         },
//         description: String,

//         content: {
//             type: [String],
//             default: [],
//         },

//         visibility: {
//             type: Boolean,
//             default: true,
//         },

//         // error done here
//         owner: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true,
//         },
//         issues: {
//             type: [Schema.Types.ObjectId],
//             ref: "Issue",
//             default: [],
//         },
//     },
//     { timestamps: true }
// );

// module.exports =
//     mongoose.models.Repository ||
//     mongoose.model("Repository", RepositorySchema);




const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: String,

        content: { type: [String], default: [] },

        visibility: { type: Boolean, default: true },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // MUST MATCH MODEL NAME
            required: true,
        },

        issues: {
            type: [Schema.Types.ObjectId],
            ref: "Issue",
            default: [],
        },
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.Repository ||
    mongoose.model("Repository", RepositorySchema);
