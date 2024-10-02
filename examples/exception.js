'use strict';

const marley = require('../');

//
// TODO: THIS IS BROKEN & MUST BE FIXED BEFORE 3.0
// This should output what was previously referred to
// as "humanReadableUncaughtExceptions" by default.
//
const logger = marley.createLogger({
  format: marley.format.simple(),
  transports: [
    new marley.transports.Console({ handleExceptions: true })
  ]
});

throw new Error('Hello, marley!');
