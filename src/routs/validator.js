const mongoose = require("mongoose");
const {
  Config,
  MtxLog,
  DocData,
  Users,
  ErpConfig,
} = require("../DBs/dbObjects/MGschemas");
const list_of_tables = ["Users", "Config", "ErpConfig", "MtxLog"];
const column_name_list = ["_id", "userID", "userID", "userID"];
const action_hash_in_one_instent = {
  0: false,
  1: { 1: "update", 0: "save" },
};

const VALIDATE_REQUEST_INPUT = async (configObj, testNum) => {
  console.log("test number ~~", testNum);
  let data;
  try {
    fetchedData = await eval(list_of_tables[testNum]).find({
      [column_name_list[testNum]]: configObj.userID,
    });
  } catch (e) {
    console.log(e);
    return { status: false, data: e };
  }

  const amount_of_records_found = fetchedData.length;
  console.log("dataaaaa", fetchedData._id);
  if (amount_of_records_found == 1)
    return {
      status: true,
      action:
        action_hash_in_one_instent[testNum] &&
        action_hash_in_one_instent[testNum][amount_of_records_found],
      id: fetchedData[0]._id,
      data: fetchedData[0],
    };

  if (amount_of_records_found == 0)
    return {
      status: true,
      action:
        action_hash_in_one_instent[testNum] &&
        action_hash_in_one_instent[testNum][amount_of_records_found],
      data: null,
    };
  if (fetchedData.length != 1) {
    data += `u got ${fetchedData.length} records in dataBase ecpected 1\n`;
    console.log(data);
  }

  if (!configObj) {
    data += `problem with value of configObj u got ${configObj} expected Object\n ,`;
    console.log(data);
  }
  if (data) {
    console.log("if data");
    return { status: false, data: data };
  } else return { status: true };
};

module.exports.VALIDATE_REQUEST_INPUT = VALIDATE_REQUEST_INPUT;
