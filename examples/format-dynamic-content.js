'use strict';

const marley = require('../');

const logger = module.exports = marley.createLogger({
  transports: [new marley.transports.Console()],
  format: marley.format.combine(
    marley.format(function dynamicContent(info, opts) {
      info.message = '[dynamic content] ' + info.message;
      return info;
    })(),
    marley.format.simple()
  )
});

logger.log('info', 'This is an information message.');
