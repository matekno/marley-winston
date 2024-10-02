const fs = require('fs');
const marley = require('../');
const { createLogger, format, transports } = marley;

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.simple()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.simple()
      )
    }),
    new transports.Stream({
      stream: fs.createWriteStream('./example.log')
    })
  ]
})

logger.log({
  level: 'info',
  message: 'Check example.log – it will have no colors!'
});
