// **************** DB SERVER ********* 

const PORT = process.env.PORT || 5000;
require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const FBrouter = require("./routs/fireBaseRouts");
const MGrouter = require("./routs/mongoDbRouts");
app.use(express.json());
app.use(FBrouter);
app.use(MGrouter);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userData) => {
    if (err) return res.sendStatus(403);
    else req.userData = userData;
  });
};

app.listen(PORT, (err) =>
  console.log(`server ${err ? " on" : "listening"} port` + PORT)
);
