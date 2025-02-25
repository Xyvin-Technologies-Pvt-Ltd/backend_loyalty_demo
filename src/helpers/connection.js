const mongoose = require("mongoose");
const clc = require("cli-color");

const { MONGO_URL } = process.env;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log(clc.greenBright("✅ Database linked successfully! 🚀"));
  })
  .catch((error) => {
    console.log(
      clc.redBright("❌ Database connection failed! Check the logs below:")
    );
    console.log(clc.bgYellowBright.black(error.message || error));
  });
