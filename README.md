# 🚀Distributed Version Control System (Git-Inspired)

# 
A Git-inspired distributed version control system built from scratch to understand how version control works at a systems level — including staging, immutable commits, and remote synchronization.

This project focuses on **correctness, clarity, and architectural separation**, not on replicating Git feature-for-feature.

---

## 📌Overview

# 
The system provides a workflow similar to Git:

- Local repository initialization
- Explicit staging of files
- Immutable commit snapshots
- Remote push with clear separation of metadata and file storage
- Web dashboard for repository inspection

The project is implemented using a **custom CLI**, a **REST backend**, and **cloud object storage**.

---

## 🧱Architecture

# 
The system is divided into three layers:

1. **Local CLI**

- Handles staging and commit creation
- Maintains local repository state in a hidden directory
2. **Backend Services**

- Coordinates remote synchronization
- Manages repository metadata and activity
- Provides real-time updates to clients
3. **Cloud Infrastructure**

- MongoDB for metadata and activity logs
- AWS S3 for immutable file blobs

All cloud interactions are mediated by the backend. The CLI never communicates directly with cloud services.

---

## ⚙️Design Decisions

# 
This project was built to better understand how distributed version control systems manage state, history, and synchronization.

Instead of tracking diffs immediately, the system snapshots files during staging by physically copying them into a local repository directory. This makes state explicit and easier to reason about, especially during debugging and early development.

Each commit is stored as an immutable directory identified by a UUID. Once created, a commit is never modified. This constraint simplifies reasoning about history and mirrors the guarantees expected from production-grade version control systems.

Remote synchronization is intentionally split into two concerns. Commit metadata is stored in MongoDB, while file contents are uploaded to AWS S3 under commit-scoped paths. This separation keeps metadata lightweight and allows file storage to scale independently.

The current implementation uploads complete file snapshots rather than deltas. This was a deliberate choice to prioritize correctness and clarity over optimization. The architecture is designed to support future improvements such as delta compression, branching, and merging without changing the core model.

---

## 📁Local Repository Structure

# 
Each repository contains a hidden directory:

```
.atharvGit/
├── staging/            # Staged file snapshots
├── commits/            # Immutable commit directories (UUID-based)
└── config.json         # Local repository configuration
```

### Notes

# 
- Files are physically copied during staging
- Commits are immutable once created
- History is never rewritten

---

## 🧪CLI Commands

# 
The CLI is implemented using Node.js.

### Initialize Repository

# 
```
node index.js init
```

Creates the `.atharvGit` directory and initializes local configuration.

---

### Stage Files

# 
```
node index.js add <file>
```

Copies files into the staging area, capturing their state at that moment.

---

### Commit Changes

# 
```
node index.js commit -m "commit message"
```

- Generates a unique commit ID (UUID)
- Moves staged files into a commit directory
- Writes commit metadata

---

### Push to Remote

# 
```
node index.js push
```

Performs two coordinated operations:

1. Uploads commit file blobs to AWS S3
2. Synchronizes repository metadata with the backend

---

## 🖥️Backend Services

### Responsibilities

# 

- Repository and commit metadata management
- Activity tracking
- Real-time status updates

### Technology

# 
- Express.js (REST API)
- MongoDB (metadata and activity)
- Socket.io (real-time communication)

---

## Cloud Storage Model

### MongoDB

# 

Stores:

- Repository information
- Commit metadata
- User activity (used for contribution tracking)

### AWS S3

# 
Stores immutable file blobs organized by commit:

```
commits/<commit-id>/<filename>
```

---


## 🚀Getting Started

### Prerequisites

# 

- Node.js (v18 or newer recommended)
- MongoDB
- AWS account with S3 access

---

### Environment Variables

# 
Create a `.env` file in the backend directory:

```
MONGODB_URI=your_mongodb_connection_string
PORT=3002

JWT_SECRET_KEY=your_secret_key

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=your_bucket_name
```

---

### Installation

# 
```
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📊Project Status

### Implemented

# 

- Local staging and commits
- Immutable commit snapshots
- Remote push (metadata and blobs)
- Web dashboard
- Contribution tracking
- Real-time updates

### Planned

# 
- Delta compression
- Branching and HEAD pointers
- Merging strategies
- Multi-user collaboration
- Stronger access control

---

## 🧠Lessons Learned

# 
- Version control relies on trust in immutable history
- Explicit staging simplifies reasoning about state
- Push is a distributed systems problem, not a file upload
- Separating metadata from blobs scales better

---


## 👤Author

# 
**Atharv Kulkarni**

GitHub: https://github.com/atharv-k-979

## ✍️Blog

# 
A detailed explanation of the design and implementation decisions is available here:

Medium : https://medium.com/@atharvvk853/building-a-distributed-version-control-system-from-scratch-ad4f5082614a
Video : https://drive.google.com/file/d/1XzhVTa7augUB5i_yDfI4t9SyDNedUX3L/view?usp=sharing

---

## 🤝Contributing

# 
Contributions are welcome.

Please keep commits focused, follow the existing project structure, and document architectural changes clearly.

---

## 📄License

# 
MIT License

---
