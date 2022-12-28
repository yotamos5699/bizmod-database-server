// **************** DB SERVER ****^^*****

const PORT = process.env.PORT || 4000;
require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const FBrouter = require("./routs/fireBaseRouts.js");
const HArouter = require("./routs/bizHaApi.js");
const ROrouter = require("./routs/biziRoutApi.js");
const SIrouter = require("./routs/bizSignApi.js");
const cors = require(`cors`);
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use(FBrouter);
app.use(HArouter);
app.use(ROrouter);
app.use(SIrouter);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, (err) => {
  console.log(`DB server ${err ? " on" : "listening"} port ${PORT}`);
});
