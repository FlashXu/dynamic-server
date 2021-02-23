let fs = require("fs");

// 读数据
let data = JSON.parse(fs.readFileSync("../db/users.json").toString());
console.log(data);

// 写数据
let newData = {
  id: 4,
  name: "Alan",
  pwd: "456789",
};
data.push(newData);
fs.writeFileSync("../db/users.json", JSON.stringify(data));
