const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectMongo = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			serverSelectionTimeoutMS: 3000,
		});
		console.log("✅ MongoDB connected");
	} catch (err) {
		console.warn("⚠️ MongoDB connection warning (Activity logs will be in fallback mode):", err.message);
	}
};

module.exports = connectMongo;
