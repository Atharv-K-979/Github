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
        const path = require("path");
        const fs = require("fs").promises;
        
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
        
        // Prefer the latest non-empty object (by Size), otherwise fall back to latest by LastModified
        const nonEmpty = matchingObjects.filter((o) => (o.Size || 0) > 0);
        const pickLatestByDate = (arr) =>
            arr.reduce((latest, current) =>
                new Date(current.LastModified) > new Date(latest.LastModified) ? current : latest
            );
        const latestObject = (nonEmpty.length > 0 ? pickLatestByDate(nonEmpty) : pickLatestByDate(matchingObjects));
        
        // Fetch the file content
        const fileData = await s3.getObject({
            Bucket: S3_BUCKET,
            Key: latestObject.Key,
        }).promise();
        
        // Convert buffer to string
        let content = "";
        if (fileData && fileData.Body) {
            try {
                content = fileData.Body.toString("utf-8");
            } catch {
                content = "";
            }
        }
        // Fallback: if content is empty, try to read from local commit folder
        if (!content || content.length === 0) {
            try {
                const parts = (latestObject.Key || "").split("/");
                const commitId = parts.length >= 3 ? parts[1] : undefined;
                if (commitId) {
                    const localPath = path.resolve(process.cwd(), ".atharvGit", "commits", commitId, filename);
                    const localData = await fs.readFile(localPath, "utf-8");
                    if (typeof localData === "string" && localData.length > 0) {
                        content = localData;
                    }
                }
            } catch {
                // ignore local fallback errors
            }
        }
        
        res.json({
            filename: filename,
            content: content,
            lastModified: latestObject.LastModified,
            size: latestObject.Size,
        });
    } catch (err) {
        console.error("Error fetching file content:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function getRepoCommits(req, res) {
    try {
        const { s3, S3_BUCKET } = require("../config/aws-config");
        const data = await s3
            .listObjectsV2({
                Bucket: S3_BUCKET,
                Prefix: "commits/",
            })
            .promise();
        const map = new Map();
        for (const obj of (data.Contents || [])) {
            const parts = (obj.Key || "").split("/");
            if (parts.length < 3) continue;
            const commitId = parts[1];
            const filename = parts[2];
            if (!map.has(commitId)) {
                map.set(commitId, { files: [], lastModified: obj.LastModified });
            }
            const entry = map.get(commitId);
            entry.files.push(filename);
            if (new Date(obj.LastModified) > new Date(entry.lastModified)) {
                entry.lastModified = obj.LastModified;
            }
        }
        const entries = Array.from(map.entries());
        const items = await Promise.all(entries.map(async ([cid, v]) => {
            let message = `Updated ${v.files.length} file(s)`;
            let when = v.lastModified;
            try {
                const obj = await s3.getObject({
                    Bucket: S3_BUCKET,
                    Key: `commits/${cid}/commit.json`,
                }).promise();
                const parsed = JSON.parse(obj.Body.toString("utf-8"));
                message = parsed.message || message;
                when = parsed.date || when;
            } catch (e) {
                // ignore if commit.json missing
            }
            return {
                files: v.files,
                message,
                date: when,
            };
        }));
        const sorted = items.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(sorted);
    } catch (err) {
        console.error("Error fetching repo commits:", err.message);
        try {
            const fs = require("fs").promises;
            const path = require("path");
            const repoPath = path.resolve(process.cwd(), ".atharvGit");
            const commitsPath = path.join(repoPath, "commits");
            const commitDirs = await fs.readdir(commitsPath);
            const items = [];
            for (const cid of commitDirs) {
                const dir = path.join(commitsPath, cid);
                const files = await fs.readdir(dir);
                const filtered = files.filter(f => f !== "commit.json");
                let message = `Updated ${filtered.length} file(s)`;
                let when = undefined;
                try {
                    const jsonBuf = await fs.readFile(path.join(dir, "commit.json"));
                    const parsed = JSON.parse(jsonBuf.toString("utf-8"));
                    message = parsed.message || message;
                    when = parsed.date;
                } catch {
                    // ignore missing commit.json
                }
                items.push({
                    files: filtered,
                    message,
                    date: when || new Date().toISOString(),
                });
            }
            const sorted = items.sort((a, b) => new Date(b.date) - new Date(a.date));
            res.json(sorted);
        } catch (fallbackErr) {
            console.error("Local fallback failed:", fallbackErr.message);
            res.json([]);
        }
    }
}

async function getRepoLogs(req, res) {
    return getRepoCommits(req, res);
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
    getRepoCommits,
    getRepoLogs,
};
