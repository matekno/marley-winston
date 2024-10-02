'use strict';

const fs = require('fs');
const path = require('path');
const marley = require('../lib/marley');

const filePath = path.join(__dirname, 'marley.log');
const stream = fs.createWriteStream(filePath);

const logger = marley.createLogger({
  transports: [
    new marley.transports.Stream({ stream })
  ]
});

setTimeout(() => {
  logger.log({ level: 'info', message: 'foo' });
  logger.log({ level: 'info', message: 'bar' });
}, 1000);

setTimeout(() => {
  try {
    fs.unlinkSync(filePath); // eslint-disable-line no-sync
  } catch (ex) {} // eslint-disable-line no-empty
}, 2000);
