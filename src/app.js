// **************** DB SERVER ****^^*****

//const PORT = process.env.PORT || 4000;
const PORT = 4001;
require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const FBrouter = require("./routs/fireBaseRouts");
const MGrouter = require("./routs/mongoDbRouts");
//const { makeSchemasGraph } = require("./DBs/dbObjects/serviceApi");
const { schemass } = require("./DBs/dbObjects/matrix_Ui_Schemas");
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
app.get("/api/getSchemas", async (req, res) => {
  // let i = 4;
  // console.log("sssssssssssSSSSSSSSSSSSSSSSSSsssssssss new SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
  // let s = await makeSchemasGraph();
  // console.log(s);
  // res.send(s);
  console.log(Object.keys(schemass));
  console.log(schemass);

  res.json(schemass);
});

app.listen(PORT, (err) => {
  console.log(`DB server ${err ? " on" : "listening"} port ${PORT}`);
});
