const mongoose = require("mongoose");
const Activity = require("../models/activityModel");

async function getContributions(req, res) {
  const { userId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const uid = new mongoose.Types.ObjectId(userId);
    const pipeline = [
      { $match: { userId: uid } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y/%m/%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: {
            $switch: {
              branches: [
                { case: { $gt: ["$count", 10] }, then: 4 },
                { case: { $gte: ["$count", 6] }, then: 3 },
                { case: { $gte: ["$count", 3] }, then: 2 },
                { case: { $gte: ["$count", 1] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { date: 1 } },
    ];
    const rows = await Activity.aggregate(pipeline).exec();
    res.json(rows || []);
  } catch (err) {
    console.error("Error fetching contributions:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getContributions };
