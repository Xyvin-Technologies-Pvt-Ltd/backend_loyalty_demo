const winston = require("winston");
const { format, transports } = winston;

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/app.log" }),
  ],
});

const request_logger = (req, res, next) => {
  const start_time = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start_time;
    const log_message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.error(log_message);
    } else {
      logger.info(log_message);
    }
  });

  next();
};

const error_logger = (err, req, res, next) => {
  logger.error(`error: ${err.message} | url: ${req.originalUrl}`);
  next(err);
};

module.exports = { logger, request_logger, error_logger };
