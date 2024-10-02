const marley = require('../');

const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'magenta',
    info: 'green',
    verbose: 'cyan',
    silly: 'grey'
  }
};

marley.addColors(config.colors);
const wLogger = (input: { logName: string; level: string }): marley.Logger =>
  marley.createLogger({
    levels: config.levels,
    level: `${input.level}`,
    transports: [
      new marley.transports.Console({
        level: `${input.level}`,

        format: marley.format.combine(
          marley.format.timestamp(),
          marley.format.printf(
            info =>
              // https://stackoverflow.com/a/69044670/20358783 more detailLocaleString
              `${new Date(info.timestamp).toLocaleDateString('tr-Tr', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })} ${info.level.toLocaleUpperCase()}: ${info.message}`
          ),
          marley.format.colorize({ all: true })
        )
      }),
      new marley.transports.File({
        filename: `./src/logs/${input.logName}/${input.logName}-Error.log`,
        level: 'error',
        format: marley.format.printf(
          info =>
            `${new Date(info.timestamp).toLocaleDateString('tr-Tr', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })} ${info.level.toLocaleUpperCase()}: ${info.message}`
        )
      }),
      new marley.transports.File({
        filename: `./src/logs/${input.logName}/${input.logName}-Warn.log`,
        level: 'warn',
        format: marley.format.printf(
          info =>
            `${new Date(info.timestamp).toLocaleDateString('tr-Tr', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })} ${info.level.toLocaleUpperCase()}: ${info.message}`
        )
      }),
      new marley.transports.File({
        filename: `./src/logs/${input.logName}/${input.logName}-All.log`,
        level: 'silly',
        format: marley.format.printf(
          info =>
            `${new Date(info.timestamp).toLocaleDateString('tr-Tr', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })} ${info.level.toLocaleUpperCase()}: ${info.message}`
        )
      }),

      new marley.transports.File({
        format: marley.format.printf(
          info =>
            `${new Date(info.timestamp).toLocaleDateString('tr-Tr', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })} ${info.level.toLocaleUpperCase()}: ${info.message}`
        ),
        filename: './src/logs/globalLog.log',
        level: 'silly'
      })
    ]
  });

export default wLogger;

//const logger = wLogger({ logName: moduleName, level: logLevel })
//logger.info('test')
