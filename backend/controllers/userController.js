const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const uri = process.env.MONGODB_URI;

let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(uri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        await client.connect();
    }
}

async function signup(req, res) {
    const { username, password, email } = req.body; //tried to fix
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists bro !!" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            starRepos: [],
        };
        const result = await usersCollection.insertOne(newUser);
        const token = jwt.sign(
            { id: result.insertedId },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "120h" }
        );
        res.json({ token, userId: result.insertedId });
    } catch (err) {
        console.error("Error during signup : ", err.message);
        res.status(500).send("Server error");
    }
}

async function login(req, res) {
    const { email, password } = req.body || {}; //tried to fix
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials bro, put correct !!!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials bro, put correct !!!" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "120h",
        });
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Error during login : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getAllUsers(req, res) {
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        const users = await usersCollection.find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getUserProfile(req, res) {
    const currentID = req.params.id;
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({
            _id: new ObjectId(currentID),
        });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        // res.send(`User found :${user}`);
        res.send(user);
    } catch (err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function updateUserProfile(req, res) {
    const currentID = req.params.id;
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        let updateFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }
        const result = await usersCollection.findOneAndUpdate(
            {
                _id: new ObjectId(currentID),
            },
            {$set: updateFields},
            { returnDocument: "after"}
        );
        if (!result.value) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.send(result.value);
    } catch (err) {
        console.error("Error during updating : ", err.message);
        res.status(500).send("Server error!");
    }
}


async function deleteUserProfile(req, res) {
    const currentID = req.params.id;
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        const result = await usersCollection.deleteOne({
            _id: new ObjectId(currentID),
        });
        if (result.deleteCount == 0) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.json({ message: "User Profile Deleted!" });
    } catch (err) {
        console.error("Error during updating : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getUserActivity(req, res) {
    const currentID = req.params.id;
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        const pipeline = [
            {
                $match: {
                    _id: new ObjectId(currentID),
                },
            },
            {
                $unwind: "$pushActivity",
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$pushActivity",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1,
                },
            },
            {
                $sort: { date: 1 },
            },
        ];
        const activity = await usersCollection.aggregate(pipeline).toArray();
        res.json(activity);
    } catch (err) {
        console.error("Error during fetching activity : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function starRepository(req, res) {
    const { userId, repoId } = req.body;
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(repoId)) {
            return res.status(400).json({ message: "Invalid user or repository ID" });
        }

        const userObjectId = new ObjectId(userId);
        const repoObjectId = new ObjectId(repoId);

        const user = await usersCollection.findOne({ _id: userObjectId });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const starRepos = user.starRepos || [];
        const isStarred = starRepos.some(
            (id) => id.toString() === repoObjectId.toString()
        );

        if (isStarred) {
            await usersCollection.updateOne(
                { _id: userObjectId },
                { $pull: { starRepos: repoObjectId } }
            );
            return res.json({
                message: "Repository unstarred successfully",
                starred: false,
            });
        } else {
            await usersCollection.updateOne(
                { _id: userObjectId },
                { $addToSet: { starRepos: repoObjectId } }
            );
            return res.json({
                message: "Repository starred successfully",
                starred: true,
            });
        }
    } catch (err) {
        console.error("Error during star/unstar repository : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getStarredRepositories(req, res) {
    const userId = req.params.userId;
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        const reposCollection = db.collection("repositories");

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const userObjectId = new ObjectId(userId);
        const user = await usersCollection.findOne({ _id: userObjectId });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const starRepos = user.starRepos || [];
        if (!Array.isArray(starRepos) || starRepos.length === 0) {
            return res.json({ repositories: [] });
        }

        const repoIds = starRepos
            .filter((id) => ObjectId.isValid(id))
            .map((id) => new ObjectId(id));

        if (repoIds.length === 0) {
            return res.json({ repositories: [] });
        }

        const repositories = await reposCollection
            .find({ _id: { $in: repoIds } })
            .toArray();

        res.json({ repositories: repositories || [] });
    } catch (err) {
        console.error("Error during fetching starred repositories : ", err.message);
        res.status(500).json({ message: "Server error!", error: err.message });
    }
}

async function followUser(req, res) {
    const { userId, targetUserId } = req.body;
    try {
        await connectClient();
        const db = client.db("Github");
        const usersCollection = db.collection("users");
        
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        const targetUser = await usersCollection.findOne({ _id: new ObjectId(targetUserId) });
        
        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        
        // Check if already following
        const isFollowing = user.followedUsers && user.followedUsers.some(
            id => id.toString() === targetUserId.toString()
        );
        
        if (isFollowing) {
            // Unfollow: remove from followedUsers
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $pull: { followedUsers: new ObjectId(targetUserId) } }
            );
            res.json({ message: "User unfollowed successfully", following: false });
        } else {
            // Follow: add to followedUsers
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $addToSet: { followedUsers: new ObjectId(targetUserId) } }
            );
            res.json({ message: "User followed successfully", following: true });
        }
    } catch (err) {
        console.error("Error during follow/unfollow user : ", err.message);
        res.status(500).send("Server error!");
    }
}
// console.log("REQ BODY:", req.body);

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    starRepository,
    getStarredRepositories,
    getUserActivity,
    followUser,
};
