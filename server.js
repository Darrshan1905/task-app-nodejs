const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const initialSeeding = require("./config/seed");

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use("/api/projects", require('./routes/projectRoutes'));
app.use("/api/users", require('./routes/userRoutes'));

app.listen(port, () => {
    console.log(`Server is running in port ${port}`);
})