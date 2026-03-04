const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/error.log");

function logError(error) {
  const log = `
Time: ${new Date().toISOString()}
Message: ${error.message}
Stack: ${error.stack}
-----------------------------------
`;

  fs.appendFileSync(logFile, log);
}

module.exports = { logError };