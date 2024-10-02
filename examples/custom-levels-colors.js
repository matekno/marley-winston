'use strict';

const marley = require('../lib/marley');

//
// Logging levels
//
const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
    custom: 7
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta',
    custom: 'yellow'
  }
};

marley.addColors(config.colors);

const logger = module.exports = marley.createLogger({
  levels: config.levels,
  format: marley.format.combine(
    marley.format.colorize(),
    marley.format.simple()
  ),
  transports: [
    new marley.transports.Console()
  ],
  level: 'custom'
});

logger.custom('hello')
