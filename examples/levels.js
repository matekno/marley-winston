'use strict';

const marley = require('../');

const defaultLevels = marley.createLogger({
  level: 'silly',
  format: marley.format.simple(),
  transports: new marley.transports.Console()
});

function logAllLevels() {
  Object.keys(marley.config.npm.levels).forEach(level => {
    defaultLevels[level](`is logged when logger.level="${defaultLevels.level}"`);
  });
}

logAllLevels();

//
// TODO: THIS IS BROKEN & MUST BE FIXED BEFORE 3.0
// Logger.prototype.level must be a setter to set the
// default level on all Transports.
//
defaultLevels.level = 'error';
logAllLevels();
