'use strict';

const marley = require('../');

const logger = marley.createLogger({
  level: 'info',
  format: marley.format.combine(
    //
    // Notice that both arguments have been combined into a single
    // "info" object.
    //
    marley.format(function (info, opts) {
      console.log(`{ reason: ${info.reason}, promise: ${info.promise} }`);
      return info;
    })(),
    marley.format.json()
  ),
  transports: [
    new marley.transports.Console()
  ]
});

logger.info('my message', { reason: 'whatever', promise: 'whenever' });
