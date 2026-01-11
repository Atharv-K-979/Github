const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config();

// Configure AWS region
const region = process.env.AWS_REGION || "ap-south-1";
AWS.config.update({ region });

// Get AWS credentials from environment variables and trim whitespace
const accessKeyId = process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.trim() : undefined;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY.trim() : undefined;

// Configure AWS credentials if provided
if (accessKeyId && secretAccessKey) {
    AWS.config.update({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    });
} else {
    console.warn("AWS credentials not found in environment variables.");
    console.warn("Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.");
    console.warn("The SDK will attempt to use default credential provider chain.");
}

// Get S3 bucket from environment variable or use default
const S3_BUCKET = process.env.S3_BUCKET || "atharvawsbucket4045";

const s3 = new AWS.S3();

module.exports = { s3, S3_BUCKET };