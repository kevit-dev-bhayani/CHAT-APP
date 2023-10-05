const { WinstonChannelLogger } = require("@kevit/winston-channel-logger");
const { transports, createLogger } = require("winston");
const winstonChannelLogger = new WinstonChannelLogger({
  level: "silly",
  platforms: [
    {
      platformName: "ms-teams",
      webhookUrl:process.env.URL,
    },
  ],
});
const logger = createLogger({
  transports: [
    new transports.Console({ level: "silly" }),
    winstonChannelLogger,
  ],
});
module.exports = logger;
