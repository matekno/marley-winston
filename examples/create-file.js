'use strict';

const fs = require('fs');
const path = require('path');
const marley = require('../lib/marley');

const filename = path.join(__dirname, 'created-logfile.log');

//
// Remove the file, ignoring any errors
//
try { fs.unlinkSync(filename); }
catch (ex) { }

//
// Create a new marley logger instance with two tranports: Console, and File
//
//
const logger = marley.createLogger({
  transports: [
    new marley.transports.Console(),
    new marley.transports.File({ filename })
  ]
});

logger.log('info', 'Hello created log files!', { 'foo': 'bar' });

setTimeout(function () {
  //
  // Remove the file, ignoring any errors
  //
  try { fs.unlinkSync(filename); }
  catch (ex) { }
}, 1000);
