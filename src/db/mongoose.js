const mongoose = require("mongoose");

//const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager-api";

mongoose.connect(process.env.MONGODB_URL + "/" + databaseName, {
  useNewUrlParser: true,
});
