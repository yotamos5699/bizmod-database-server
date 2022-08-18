const express = require("express");
const FBrouter = express.Router();
const fbHelper = require('../DBs/fbHelper')
FBrouter.use(express.json());
FBrouter.post("/api/savesignedFiles", async function (req, res) {

    let fileName = await req.body.fileName
    let file = await req.body.file
    let account = await req.body.AccountKey
    try {
        fbHelper.uploadFile(fileName, file, account).then(
            console.log("file uploaded...")
        )
    } catch (err) {
        console.log('error on uploading file')
        return res.send('error').end;
    }
    return res.send('file uploaded').end
});

FBrouter.get("/api/loadsignedFiles", async function (req, res) {
    let path = await req.body.Path
    let accounts = await ewq.body.Accounts
    try {
        let urlsList = await fbHelper.getUrlList(path, accounts)
        res.json({
            data: JSON.stringify(urlsList)
        }).end;
    } catch (err) {

        console.log(err)
        res.json({
            data: 'error'
        }).end;
    }

});
module.exports = FBrouter;