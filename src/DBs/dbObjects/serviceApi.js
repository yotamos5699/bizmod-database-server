// const { schemass } = require("./matrix_Ui_Schemas");

// // const schemas = [
// //   { name: DocData, data: docsData.tree, subschema: SigningStat },
// //   { name: MtxLog, data: matrixesData.tree, subschema: innerLog },
// //   { name: Users, data: users.tree, subschema: UserData },
// //   { name: Config, data: config.tree },
// // ];

// const makeSchemasGraph = async () => {
//   const schemas = schemass;
//   let Schemas = [];

//   for (let i = 0; i <= schemas.length - 1; i++) {
//     let headers = Object.keys(schemas[i].data);
//     let values = Object.values(schemas[i].data);

//     let record = {};
//     for (let j = 0; j <= headers.length - 1; j++) {
//       console.log(values[j], "sssss vallues", headers[j], "headers !!!");
//       if (values[j] == "Schema") {
//         console.log(values[j], "sssss vallues = schema  1!!!!", headers[j], "headers !!!");
//         record[headers[j]] = schemas[i][schemas[i].subschema].tree;
//         break;
//       } else record[headers[j]] = values[j];
//     }
//     Schemas.push({
//       name: schemas[i].name,
//       graph: record,
//     });
//     console.log("schema row !@@@@@%$$$$ ", Schemas[i]);
//   }
//   //console.log(Schemas);
//   return Schemas;
// };

// module.exports.makeSchemasGraph = makeSchemasGraph;
