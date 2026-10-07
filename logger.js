const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "requests.log");

function logRequest(req, res, next)
{
  const line = req.method + " " + req.originalUrl + " " + new Date().toISOString() + "\n";
  fs.appendFileSync(logFile, line);
  next();
}

module.exports = logRequest;
