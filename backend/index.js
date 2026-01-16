const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

dotenv.config();

yargs(hideBin(process.argv))
    .command("start", "Starts a new server", {}, startServer)
    .command("init", "Initialise a new repository", {}, initRepo)
    .command(
        "add <file>",
        "Add a file to the repository",
        (yargs) => {
            yargs.positional("file", {
                describe: "File to add to the staging area",
                type: "string",
            });
        },
        (argv) => {
            addRepo(argv.file);
        }
    )
    .command(
        "commit <message>",
        "Commit the staged files",
        (yargs) => {
            yargs.positional("message", {
                describe: "Commit message",
                type: "string",
            });
        },
        (argv) => {
            commitRepo(argv.message);
        }
    )
    .command(
        "push [repoId]",
        "Push commits to S3 and optionally sync with MongoDB repository",
        (yargs) => {
            yargs.positional("repoId", {
                describe: "MongoDB Repository ID to update with pushed files",
                type: "string",
            });
        },
        (argv) => {
            pushRepo(argv.repoId);
        }
    )
    .command("pull", "Pull commits from S3", {}, pullRepo)
    .command(
        "revert <commitID>",
        "Revert to a specific commit",
        (yargs) => {
            yargs.positional("commitID", {
                describe: "Comit ID to revert to",
                type: "string",
            });
        },
        (argv) => {
            revertRepo(argv.commitID);
        }
    )
    .demandCommand(1, "You need at least one command")
    .help().argv;

function startServer() {
    const app = express();
    const port = process.env.PORT || 3002;
// 
    app.use(bodyParser.json());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        console.error("MONGODB_URI is not defined in .env file");
        return;
    }

    mongoose
        .connect(mongoURI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 30000, // 30 seconds
        })
        .then(() => console.log("MongoDB connected!"))
        .catch((err) => {
            console.error("Unable to connect to MongoDB:", err.message);
            console.error("\nTroubleshooting tips:");
            console.error("1. Check your internet connection");
            console.error("2. Verify your MONGODB_URI in .env file is correct");
            console.error("3. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)");
            console.error("4. Verify DNS resolution is working");
        });
    app.use(cors({ origin: "*" }));
    app.use("/", mainRouter);
    let user = "test";
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            user = userID;
            console.log("===========");
            console.log(user);
            console.log("===========");
            socket.join(userID);
        });
    });
    const db = mongoose.connection;
    db.once("open", async () => {
        console.log("CRUD operations called");
        // CRUD operations
    });
    httpServer.on("error", (err) => {
        if (err && err.code === "EADDRINUSE") {
            console.log(`Port ${port} is in use, assuming server already running on this port`);
        } else {
            console.error("Server error:", err && err.message ? err.message : err);
        }
    });
    httpServer.listen(port, () => {
        console.log(`Server is running on PORT ${port}`);
    });
}