const marley = require('../');

const loggers = {
  splat: marley.createLogger({
    level: 'info',
    format: marley.format.combine(
      marley.format.splat(),
      marley.format.simple()
    ),
    transports: [new marley.transports.Console()],
  }),
  simple: marley.createLogger({
    level: 'info',
    format: marley.format.simple(),
    transports: [new marley.transports.Console()],
  })
};

const meta = {
  subject: 'Hello, World!',
  message: 'This message is a unique property separate from implicit merging.',
};

loggers.simple.info('email.message is hidden', meta);
loggers.simple.info('email.message is hidden %j\n', meta);

loggers.splat.info('This is overridden by meta', meta);
loggers.splat.info('email.message is shown %j', meta);
