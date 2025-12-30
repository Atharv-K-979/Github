// {
//     "Version": "2012-10-17",
//     "Statement": [
//         {
//         "Effect": "Allow",
//         "Principal": {
//         "AWS": "your-aws-account-id arm"
//         },
//         "Action": "s3:*",
//         "Resource":[
//             "arn:aws:s3:::bucket_name_here",
//             "arn:aws:s3:::bucket_name_here/*"
//             ]
//         }
//     ]
// }








// Install AWS CLI on Linux (Ubuntu)
// Run these commands one by one:

// sudo apt update
// sudo apt install unzip curl -y

// curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

// unzip awscliv2.zip

// sudo ./aws/install

// Verify installation

// aws --version

// You should see something like:
// aws-cli/2.x.x Python/3.x Linux/x86_64



// Configure AWS credentials (VERY IMPORTANT)
// Run:
// aws configure
// Enter:
// AWS Access Key ID:     <your-access-key>
// AWS Secret Access Key: <your-secret-key>
// Default region name:   eu-north-1
// Default output format: json

// Use the same IAM user you used for your Node app.
