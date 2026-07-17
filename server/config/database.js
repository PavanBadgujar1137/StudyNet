const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL } = process.env;

exports.connect = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("✅ DB Connection Success");
  } catch (err) {
    console.log("❌ DB Connection Failed");
    console.log(err);
    process.exit(1);
  }
};