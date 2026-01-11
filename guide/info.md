# Project Overview: S3-Backed Version Control & Repository Manager

This project consists of two separate systems working together to manage file versioning and repository display.

## 1. Local S3 Git-like System (CLI)
This is a custom version control tool that uses AWS S3 as the remote storage backend instead of standard Git servers.
- **Core Logic:** Uses `add`, `commit`, `push`, and `pull` commands via `index.js`.
- **Local Storage:** Files are tracked in the `.atharvGit/commits/{commitId}/` directory.
- **Remote Storage:** When pushed, files are stored at `s3://atharvawsbucket4045/commits/{commitId}/{filename}`.
- **Purpose:** Handles the actual backup and versioning of file data.

## 2. MongoDB Repository System (Frontend)
The web interface used to browse and manage repositories.
- **Frontend:** Built with React.
- **Database:** MongoDB stores repository metadata.
- **Data Model:** Each repository document has a `content` field, which is an array of filenames stored as strings.
- **UI:** The `/repo/:id` page displays the filenames stored in the MongoDB `content` field.

## Current Project Structure
- `.atharvGit/` - Local version control metadata.
- `.env` - Environment variables (AWS keys, MongoDB URI) - *Ignored by GitHub*.
- `index.js` - Entry point for the CLI system.
- `server.js` - Express backend for the React frontend and MongoDB connection.
- `src/` - React frontend source code.