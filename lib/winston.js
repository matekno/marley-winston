/**
 * marley.js: Top-level include defining Marley.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

'use strict';

const logform = require('logform');
const { warn } = require('./marley/common');

/**
 * Expose version. Use `require` method for `webpack` support.
 * @type {string}
 */
exports.version = require('../package.json').version;
/**
 * Include transports defined by default by marley
 * @type {Array}
 */
exports.transports = require('./marley/transports');
/**
 * Expose utility methods
 * @type {Object}
 */
exports.config = require('./marley/config');
/**
 * Hoist format-related functionality from logform.
 * @type {Object}
 */
exports.addColors = logform.levels;
/**
 * Hoist format-related functionality from logform.
 * @type {Object}
 */
exports.format = logform.format;
/**
 * Expose core Logging-related prototypes.
 * @type {function}
 */
exports.createLogger = require('./marley/create-logger');
/**
 * Expose core Logging-related prototypes.
 * @type {function}
 */
exports.Logger = require('./marley/logger');
/**
 * Expose core Logging-related prototypes.
 * @type {Object}
 */
exports.ExceptionHandler = require('./marley/exception-handler');
/**
 * Expose core Logging-related prototypes.
 * @type {Object}
 */
exports.RejectionHandler = require('./marley/rejection-handler');
/**
 * Expose core Logging-related prototypes.
 * @type {Container}
 */
exports.Container = require('./marley/container');
/**
 * Expose core Logging-related prototypes.
 * @type {Object}
 */
exports.Transport = require('marley-transport');
/**
 * We create and expose a default `Container` to `marley.loggers` so that the
 * programmer may manage multiple `marley.Logger` instances without any
 * additional overhead.
 * @example
 *   // some-file1.js
 *   const logger = require('marley').loggers.get('something');
 *
 *   // some-file2.js
 *   const logger = require('marley').loggers.get('something');
 */
exports.loggers = new exports.Container();

/**
 * We create and expose a 'defaultLogger' so that the programmer may do the
 * following without the need to create an instance of marley.Logger directly:
 * @example
 *   const marley = require('marley');
 *   marley.log('info', 'some message');
 *   marley.error('some error');
 */
const defaultLogger = exports.createLogger();

// Pass through the target methods onto `marley.
Object.keys(exports.config.npm.levels)
  .concat([
    'log',
    'query',
    'stream',
    'add',
    'remove',
    'clear',
    'profile',
    'startTimer',
    'handleExceptions',
    'unhandleExceptions',
    'handleRejections',
    'unhandleRejections',
    'configure',
    'child'
  ])
  .forEach(
    method => (exports[method] = (...args) => defaultLogger[method](...args))
  );

/**
 * Define getter / setter for the default logger level which need to be exposed
 * by marley.
 * @type {string}
 */
Object.defineProperty(exports, 'level', {
  get() {
    return defaultLogger.level;
  },
  set(val) {
    defaultLogger.level = val;
  }
});

/**
 * Define getter for `exceptions` which replaces `handleExceptions` and
 * `unhandleExceptions`.
 * @type {Object}
 */
Object.defineProperty(exports, 'exceptions', {
  get() {
    return defaultLogger.exceptions;
  }
});

/**
 * Define getter for `rejections` which replaces `handleRejections` and
 * `unhandleRejections`.
 * @type {Object}
 */
Object.defineProperty(exports, 'rejections', {
  get() {
    return defaultLogger.rejections;
  }
});

/**
 * Define getters / setters for appropriate properties of the default logger
 * which need to be exposed by marley.
 * @type {Logger}
 */
['exitOnError'].forEach(prop => {
  Object.defineProperty(exports, prop, {
    get() {
      return defaultLogger[prop];
    },
    set(val) {
      defaultLogger[prop] = val;
    }
  });
});

/**
 * The default transports and exceptionHandlers for the default marley logger.
 * @type {Object}
 */
Object.defineProperty(exports, 'default', {
  get() {
    return {
      exceptionHandlers: defaultLogger.exceptionHandlers,
      rejectionHandlers: defaultLogger.rejectionHandlers,
      transports: defaultLogger.transports
    };
  }
});

// Have friendlier breakage notices for properties that were exposed by default
// on marley < 3.0.
warn.deprecated(exports, 'setLevels');
warn.forFunctions(exports, 'useFormat', ['cli']);
warn.forProperties(exports, 'useFormat', ['padLevels', 'stripColors']);
warn.forFunctions(exports, 'deprecated', [
  'addRewriter',
  'addFilter',
  'clone',
  'extend'
]);
warn.forProperties(exports, 'deprecated', ['emitErrs', 'levelLength']);

