'use strict';

const marley = require('../');

const logger = module.exports = marley.createLogger({
  transports: [new marley.transports.Console()],
  format: marley.format.combine(
    marley.format.colorize({ all: true }),
    marley.format.simple()
  )
});

logger.log('info', 'This is an information message.');
