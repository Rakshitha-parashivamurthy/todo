const express = require("express");
const cors = require("cors");

const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", logRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});