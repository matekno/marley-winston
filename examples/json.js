'use strict';

const marley = require('../');

//
// As of marley@3, the default logging format is JSON.
//
const logger = marley.createLogger({
  transports: [
    new marley.transports.Console(),
  ]
});

logger.log('info', 'Hello, this is a raw logging event',   { 'foo': 'bar' });
logger.log('info', 'Hello, this is a raw logging event 2', { 'foo': 'bar' });
