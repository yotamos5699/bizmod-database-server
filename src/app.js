// **************** DB SERVER ****^^*****

const PORT = process.env.PORT || 5000;
require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const FBrouter = require("./routs/fireBaseRouts");
const MGrouter = require("./routs/mongoDbRouts");
const cors = require(`cors`);
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use(FBrouter);
app.use(MGrouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, (err) =>
  console.log(`server ${err ? " on" : "listening"} port` + PORT)
);
