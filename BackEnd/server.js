const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 5000;


const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Donation Management API is running...");
});


//routes
const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", donationRoutes);
app.use("/api/v1/claims", transactionRoutes);
app.use("/api/v1/notifications", notificationRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('DB error:', err));
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
