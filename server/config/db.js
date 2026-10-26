const mongoose = require("mongoose");

let isConnected = false;
let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/futureselector";
  
  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    autoIndex: true
  }).then((conn) => {
    isConnected = true;
    console.log(`🟢 [MONGODB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  }).catch((error) => {
    cachedPromise = null;
    isConnected = false;
    console.error(`🔴 [MONGODB CONNECTION ERROR]: ${error.message}`);
    throw error;
  });

  return cachedPromise;
};

// Connection Event Listeners
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ [MONGODB] Disconnected from database.");
  isConnected = false;
});

mongoose.connection.on("reconnected", () => {
  console.log("🟢 [MONGODB] Reconnected to database.");
  isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 [MONGODB RUNTIME ERROR]:", err.message);
});

// Graceful Shutdown
const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("🔒 [MONGODB] Connection closed cleanly for process shutdown.");
  }
};

process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDB();
  process.exit(0);
});

const getDBStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || "None",
  name: mongoose.connection.name || "None"
});

module.exports = { connectDB, closeDB, getDBStatus };
