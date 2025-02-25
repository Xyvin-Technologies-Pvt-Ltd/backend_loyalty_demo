const fs = require("fs");
const path = require("path");
const response_handler = require("../../helpers/response_handler");

exports.log_file = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["info", "error"].includes(type)) {
      return response_handler(
        res,
        400,
        "Invalid log type. Use 'info' or 'error'."
      );
    }

    const logs = await read_logs(type);
    return response_handler(res, 200, "Logs fetched successfully!", logs);
  } catch (error) {
    return response_handler(
      res,
      500,
      `Internal Server Error. ${error.message}`
    );
  }
};

//? Function to read logs from a file
const read_logs = (logType) => {
  return new Promise((resolve, reject) => {
    const logFile = path.join(__dirname, `../../../logs/${logType}.log`);

    fs.readFile(logFile, "utf8", (err, data) => {
      if (err) {
        reject(`Error reading ${logType}.log file.`);
      } else {
        resolve(data.split("\n").filter(Boolean));
      }
    });
  });
};
