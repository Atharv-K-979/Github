const mongoose = require("mongoose");
const { Schema } = mongoose;

const ActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
