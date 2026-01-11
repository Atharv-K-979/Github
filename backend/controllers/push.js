const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");
const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const dotenv = require("dotenv");

dotenv.config();

async function pushRepo(repoId) {
    const repoPath = path.resolve(process.cwd(), ".atharvGit");
    const commitsPath = path.join(repoPath, "commits");
    
    try {
        // Collect all unique filenames from all commits
        const allFiles = new Set();
        const commitDirs = await fs.readdir(commitsPath);
        
        // Push files to S3 and collect filenames
        for (const commitDir of commitDirs) {
            const commitPath = path.join(commitsPath, commitDir);
            const files = await fs.readdir(commitPath);
            
            for (const file of files) {
                // Skip commit.json file
                if (file === "commit.json") continue;
                
                const filePath = path.join(commitPath, file);
                const fileContent = await fs.readFile(filePath);
                const params = {
                    Bucket: S3_BUCKET,
                    Key: `commits/${commitDir}/${file}`,
                    Body: fileContent,
                };
                await s3.upload(params).promise();
                allFiles.add(file);
            }
        }
        
        console.log("All commits pushed to S3 !!!");
        
        // Update MongoDB Repository if repoId is provided
        if (repoId) {
            let needsToCloseConnection = false;
            try {
                // Connect to MongoDB if not already connected
                if (mongoose.connection.readyState === 0) {
                    await mongoose.connect(process.env.MONGODB_URI, {
                        serverSelectionTimeoutMS: 30000, // 30 seconds
                        socketTimeoutMS: 45000,
                        connectTimeoutMS: 30000,
                    });
                    needsToCloseConnection = true;
                }
                
                // Validate repoId
                if (!mongoose.Types.ObjectId.isValid(repoId)) {
                    console.error("❌ Invalid repository ID format");
                    if (needsToCloseConnection) await mongoose.connection.close();
                    return;
                }
                
                // Find and update the repository
                const repository = await Repository.findById(repoId);
                if (!repository) {
                    console.error(`❌ Repository with ID ${repoId} not found`);
                    if (needsToCloseConnection) await mongoose.connection.close();
                    return;
                }
                
                // Update content array with all unique filenames
                // Merge with existing content to avoid duplicates
                const existingContent = new Set(repository.content || []);
                allFiles.forEach(file => existingContent.add(file));
                repository.content = Array.from(existingContent);
                
                await repository.save();
                console.log(`✅ Repository "${repository.name}" updated with ${allFiles.size} file(s)`);
                console.log(`   Files: ${Array.from(allFiles).join(", ")}`);
                
                // Close connection if we opened it
                if (needsToCloseConnection) {
                    await mongoose.connection.close();
                }
            } catch (mongoErr) {
                console.error("❌ Error updating MongoDB repository:", mongoErr.message);
                if (mongoErr.message.includes("timed out") || mongoErr.message.includes("ETIMEOUT")) {
                    console.error("\n💡 Troubleshooting tips:");
                    console.error("   1. Check your internet connection");
                    console.error("   2. Verify MONGODB_URI in .env file is correct");
                    console.error("   3. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)");
                    console.error("   4. Files were successfully pushed to S3, but MongoDB sync failed");
                    console.error("   5. You can manually update the repository content via the API or frontend");
                }
                if (needsToCloseConnection && mongoose.connection.readyState === 1) {
                    try {
                        await mongoose.connection.close();
                    } catch (closeErr) {
                        // Ignore close errors
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error pushing to S3:", err.message);
        
        // Provide helpful error messages for common issues
        if (err.code === "SignatureDoesNotMatch") {
            console.error("\n❌ SignatureDoesNotMatch Error:");
            console.error("   This usually means your AWS credentials are incorrect.");
            console.error("   Please check:");
            console.error("   1. AWS_ACCESS_KEY_ID in .env file is correct");
            console.error("   2. AWS_SECRET_ACCESS_KEY in .env file is correct");
            console.error("   3. No extra spaces or quotes around credentials in .env");
            console.error("   4. Credentials match the IAM user in AWS Console");
            console.error("   5. The IAM user has S3 permissions for bucket:", S3_BUCKET);
        } else if (err.code === "InvalidAccessKeyId") {
            console.error("\n❌ InvalidAccessKeyId Error:");
            console.error("   Your AWS_ACCESS_KEY_ID is invalid or doesn't exist.");
        } else if (err.code === "AccessDenied") {
            console.error("\n❌ AccessDenied Error:");
            console.error("   Your IAM user doesn't have permission to access this S3 bucket.");
        }
        
        // Log full error for debugging
        console.error("\nFull error details:", err.code || err.name);
    }
}

module.exports = { pushRepo };