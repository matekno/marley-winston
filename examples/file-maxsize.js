const path = require('path');
const { MESSAGE } = require('triple-beam');
const marley = require('../');

const logger = marley.createLogger({
  level: 'info',
  format: marley.format.printf(info => `${info.message}`),
  transports: [
    new marley.transports.File({
      filename: path.join(__dirname, 'error.log'),
      level: 'info',
      maxsize: 500
    })
  ]
});

// Write 750 characters
logger.info(`test=${'a'.repeat(245)}`);
logger.info(`test=${'b'.repeat(245)}`);
logger.info(`test=${'c'.repeat(245)}`);

setTimeout(() => {
  logger.info(`test=${'d'.repeat(245)}`);
  logger.info(`test=${'e'.repeat(245)}`);
  logger.info(`test=${'f'.repeat(245)}`);
}, 2000);
