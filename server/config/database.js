const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.DB_URL)
    .then(() => console.log("Database is connected successfully!!!"))
    .catch( (error) => {
        console.log("Error while connecting to database!!!");
        console.error(error);
        process.exit(1);
    })
}