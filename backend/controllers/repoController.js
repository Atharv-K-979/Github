const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");
// console.log("CREATE REPOSITORY CONTROLLER HIT");

// async function createRepository(req, res) {
//     const { owner, name, issues, content, description, visibility } = req.body;
//     try {
//         if (!name) {
//             return res.status(400).json({ error: "Repository name is required bro !!!" });
//         }
//         if (!mongoose.Types.ObjectId.isValid(owner)) {
//             return res.status(400).json({ error: "Invalid User ID!" });
//         }
//         const newRepository = new Repository({
//             name,
//             description,
//             visibility,
//             owner,
//             content,
//             issues,
//         });
//         const result = await newRepository.save();
//         res.status(201).json({
//             message: "Repository created successfully !!!",
//             repositoryID: result._id,
//         });
//     } catch (err) {
//         console.error("Error during repository creation : ", err.message);
//         res.status(500).send("Server error");
//     }
// }
// // console.log("ended REPOSITORY CONTROLLER HIT");



async function createRepository(req, res) {
    const { owner, name, issues = [], content = [], description, visibility = true } = req.body;

    try {
        console.log("createRepository called with owner:", owner);
        
        if (!name) {
            return res.status(400).json({ error: "Repository name is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(owner)) {
            console.error("Invalid owner ID:", owner);
            return res.status(400).json({ error: "Invalid User ID" });
        }

        // VERIFY OWNER EXISTS - Use MongoDB client to match how users are created
        const { MongoClient } = require("mongodb");
        const dotenv = require("dotenv");
        dotenv.config();
        const uri = process.env.MONGODB_URI;
        
        let client;
        try {
            client = new MongoClient(uri);
            await client.connect();
            const db = client.db("Github");
            const usersCollection = db.collection("users");
            
            const ownerObjectId = new mongoose.Types.ObjectId(owner);
            console.log("Looking for user with ObjectId:", ownerObjectId.toString());
            
            const user = await usersCollection.findOne({ 
                _id: ownerObjectId 
            });
            
            console.log("User found:", user ? "Yes" : "No");
            
            if (!user) {
                await client.close();
                return res.status(404).json({ error: "Owner not found" });
            }

            // CREATE REPO using Mongoose
            const repository = await Repository.create({
                name,
                description,
                visibility,
                owner: ownerObjectId,
                content,
                issues,
            });

            console.log("Repository created:", repository._id);

            // LINK REPO TO USER (GitHub-style) - Update using MongoDB client
            await usersCollection.updateOne(
                { _id: ownerObjectId },
                { $push: { repositories: repository._id } }
            );
            
            await client.close();

            res.status(201).json({
                message: "Repository created successfully",
                repository,
            });
        } catch (mongoErr) {
            console.error("MongoDB error:", mongoErr);
            if (client) await client.close();
            throw mongoErr;
        }
    } catch (err) {
        console.error("Error during repository creation:", err);
        res.status(500).json({ error: "Server error" });
    }
}



async function getAllRepositories(req, res) {
    try {
        const repositories = await Repository.find({})
            .populate("owner")
            .populate("issues");
        res.json(repositories);
    } catch (err) {
        console.error("Error during fetching repositories : ", err.message);
        res.status(500).send("Server error");
    }
}



async function fetchRepositoryById(req, res) {
    const { id } = req.params;
    try {
        const repository = await Repository.findById(id)
            .populate("owner")
            .populate("issues");
        if (!repository) {
            return res.status(404).json({ error: "Repository not found" });
        }
        res.json(repository);
    } catch (err) {
        console.error("Error during fetching repository : ", err.message);
        res.status(500).send("Server error");
    }
}



async function fetchRepositoryByName(req, res) {
    const { name } = req.params;
    try {
        const repository = await Repository.find({ name })
            .populate("owner")
            .populate("issues");
        res.json(repository);
    } catch (err) {
        console.error("Error during fetching repository : ", err.message);
        res.status(500).send("Server error");
    }
}



async function fetchRepositoriesForCurrentUser(req, res) {
    console.log("fetchRepositoriesForCurrentUser called with userID:", req.params.userID);
    const { userID } = req.params;
    try {
        // Convert userID string to ObjectId for proper querying
        if (!mongoose.Types.ObjectId.isValid(userID)) {
            console.error("Invalid userID:", userID);
            return res.json({ message: "Repositories found!", repositories: [] });
        }
        
        const ownerId = new mongoose.Types.ObjectId(userID);
        const repositories = await Repository.find({ owner: ownerId });
        console.log("Found repositories:", repositories.length);
        // Return empty array instead of 404 for users with no repositories
        res.json({ message: "Repositories found!", repositories: repositories || [] });
    } catch (err) {
        console.error("Error during fetching user repositories : ", err.message);
        // Return empty array on error instead of 500
        res.json({ message: "Repositories found!", repositories: [] });
    }
}



async function updateRepositoryById(req, res) {
    const { id } = req.params;
    const { content, description } = req.body;

    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }
        repository.content.push(content);
        repository.description = description;
        const updatedRepository = await repository.save();
        res.json({
            message: "Repository updated successfully !!!",
            repository: updatedRepository,
        });
    } catch (err) {
        console.error("Error during updating repository : ", err.message);
        res.status(500).send("Server error");
    }
}



async function toggleVisibilityById(req, res) {
    const { id } = req.params;
    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }
        repository.visibility = !repository.visibility;
        const updatedRepository = await repository.save();
        res.json({
            message: "Repository visibility toggled successfully !!!",
            repository: updatedRepository,
        });
    } catch (err) {
        console.error("Error during toggling visibility : ", err.message);
        res.status(500).send("Server error");
    }
}



async function deleteRepositoryById(req, res) {
    const { id } = req.params;
    try {
        const repository = await Repository.findByIdAndDelete(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        res.json({ message: "Repository deleted successfully !!!" });
    } catch (err) {
        console.error("Error during deleting repository : ", err.message);
        res.status(500).send("Server error");
    }
}



async function getFileContent(req, res) {
    const { id, filename } = req.params;
    try {
        const { s3, S3_BUCKET } = require("../config/aws-config");
        
        // List all objects in S3 with the filename
        // Files are stored as commits/{commitId}/{filename}
        const data = await s3
            .listObjectsV2({
                Bucket: S3_BUCKET,
                Prefix: "commits/",
            })
            .promise();
        
        // Find all objects that end with the filename
        const matchingObjects = (data.Contents || []).filter(obj => {
            const keyParts = obj.Key.split("/");
            return keyParts[keyParts.length - 1] === filename;
        });
        
        if (matchingObjects.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }
        
        // Get the latest version (by LastModified date)
        const latestObject = matchingObjects.reduce((latest, current) => {
            return new Date(current.LastModified) > new Date(latest.LastModified) 
                ? current 
                : latest;
        });
        
        // Fetch the file content
        const fileData = await s3.getObject({
            Bucket: S3_BUCKET,
            Key: latestObject.Key,
        }).promise();
        
        // Convert buffer to string
        const content = fileData.Body.toString('utf-8');
        
        res.json({
            filename: filename,
            content: content,
            lastModified: latestObject.LastModified,
        });
    } catch (err) {
        console.error("Error fetching file content:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoriesForCurrentUser,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById,
    getFileContent,
};
