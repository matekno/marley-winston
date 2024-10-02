# marley

A logger for just about everything.

[![Version npm](https://img.shields.io/npm/v/marley.svg?style=flat-square)](https://www.npmjs.com/package/marley)
[![npm Downloads](https://img.shields.io/npm/dm/marley.svg?style=flat-square)](https://npmcharts.com/compare/marley?minimal=true)
[![build status](https://github.com/marleyjs/marley/actions/workflows/ci.yml/badge.svg)](https://github.com/marleyjs/marley/actions/workflows/ci.yml)
[![coverage status](https://coveralls.io/repos/github/marleyjs/marley/badge.svg?branch=master)](https://coveralls.io/github/marleyjs/marley?branch=master)

[![NPM](https://nodei.co/npm/marley.png?downloads=true&downloadRank=true)](https://nodei.co/npm/marley/)

## marley@3

See the [Upgrade Guide](UPGRADE-3.0.md) for more information. Bug reports and
PRs welcome!

## Looking for `marley@2.x` documentation?

Please note that the documentation below is for `marley@3`.
[Read the `marley@2.x` documentation].

## Motivation

`marley` is designed to be a simple and universal logging library with
support for multiple transports. A transport is essentially a storage device
for your logs. Each `marley` logger can have multiple transports (see:
[Transports]) configured at different levels (see: [Logging levels]). For
example, one may want error logs to be stored in a persistent remote location
(like a database), but all logs output to the console or a local file.

`marley` aims to decouple parts of the logging process to make it more
flexible and extensible. Attention is given to supporting flexibility in log
formatting (see: [Formats]) & levels (see: [Using custom logging levels]), and
ensuring those APIs decoupled from the implementation of transport logging
(i.e. how the logs are stored / indexed, see: [Adding Custom Transports]) to
the API that they exposed to the programmer.

## Quick Start

TL;DR? Check out the [quick start example][quick-example] in `./examples/`.
There are a number of other examples in [`./examples/*.js`][examples].
Don't see an example you think should be there? Submit a pull request
to add it!

## Usage

The recommended way to use `marley` is to create your own logger. The
simplest way to do this is using `marley.createLogger`:

``` js
const marley = require('marley');

const logger = marley.createLogger({
  level: 'info',
  format: marley.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new marley.transports.File({ filename: 'error.log', level: 'error' }),
    new marley.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new marley.transports.Console({
    format: marley.format.simple(),
  }));
}
```

You may also log directly via the default logger exposed by
`require('marley')`, but this merely intended to be a convenient shared
logger to use throughout your application if you so choose.
Note that the default logger doesn't have any transports by default.
You need add transports by yourself, and leaving the default logger without any
transports may produce a high memory usage issue.

## Table of contents

* [Motivation](#motivation)
* [Quick Start](#quick-start)
* [Usage](#usage)
* [Table of Contents](#table-of-contents)
* [Logging](#logging)
  * [Creating your logger](#creating-your-own-logger)
  * [Streams, `objectMode`, and `info` objects](#streams-objectmode-and-info-objects)
* [Formats]
  * [Combining formats](#combining-formats)
  * [String interpolation](#string-interpolation)
  * [Filtering `info` Objects](#filtering-info-objects)
  * [Creating custom formats](#creating-custom-formats)
* [Logging levels]
  * [Using logging levels](#using-logging-levels)
  * [Using custom logging levels](#using-custom-logging-levels)
* [Transports]
  * [Multiple transports of the same type](#multiple-transports-of-the-same-type)
  * [Adding Custom Transports](#adding-custom-transports)
  * [Common Transport options](#common-transport-options)
* [Exceptions](#exceptions)
  * [Handling Uncaught Exceptions with marley](#handling-uncaught-exceptions-with-marley)
  * [To Exit or Not to Exit](#to-exit-or-not-to-exit)
* [Rejections](#rejections)
  * [Handling Uncaught Promise Rejections with marley](#handling-uncaught-promise-rejections-with-marley)
* [Profiling](#profiling)
* [Streaming Logs](#streaming-logs)
* [Querying Logs](#querying-logs)
* [Further Reading](#further-reading)
  * [Using the default logger](#using-the-default-logger)
  * [Awaiting logs to be written in `marley`](#awaiting-logs-to-be-written-in-marley)
  * [Working with multiple Loggers in `marley`](#working-with-multiple-loggers-in-marley)
  * [Routing Console transport messages to the console instead of stdout and stderr](#routing-console-transport-messages-to-the-console-instead-of-stdout-and-stderr)
* [Installation](#installation)
* [Run Tests](#run-tests)

## Logging

Logging levels in `marley` conform to the severity ordering specified by
[RFC5424]: _severity of all levels is assumed to be numerically **ascending**
from most important to least important._

``` js
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
```

### Creating your own Logger
You get started by creating a logger using `marley.createLogger`:

``` js
const logger = marley.createLogger({
  transports: [
    new marley.transports.Console(),
    new marley.transports.File({ filename: 'combined.log' })
  ]
});
```

A logger accepts the following parameters:

| Name          | Default                     |  Description    |
| ------------- | --------------------------- | --------------- |
| `level`       | `'info'`                    | Log only if [`info.level`](#streams-objectmode-and-info-objects) is less than or equal to this level  |
| `levels`      | `marley.config.npm.levels` | Levels (and colors) representing log priorities            |
| `format`      | `marley.format.json`       | Formatting for `info` messages  (see: [Formats])           |
| `transports`  | `[]` _(No transports)_      | Set of logging targets for `info` messages                 |
| `exitOnError` | `true`                      | If false, handled exceptions will not cause `process.exit` |
| `silent`      | `false`                     | If true, all logs are suppressed |

The levels provided to `createLogger` will be defined as convenience methods
on the `logger` returned.

``` js
//
// Logging
//
logger.log({
  level: 'info',
  message: 'Hello distributed log files!'
});

logger.info('Hello again distributed logs');
```

You can add or remove transports from the `logger` once it has been provided
to you from `marley.createLogger`:

``` js
const files = new marley.transports.File({ filename: 'combined.log' });
const console = new marley.transports.Console();

logger
  .clear()          // Remove all transports
  .add(console)     // Add console transport
  .add(files)       // Add file transport
  .remove(console); // Remove console transport
```

You can also wholesale reconfigure a `marley.Logger` instance using the
`configure` method:

``` js
const logger = marley.createLogger({
  level: 'info',
  transports: [
    new marley.transports.Console(),
    new marley.transports.File({ filename: 'combined.log' })
  ]
});

//
// Replaces the previous transports with those in the
// new configuration wholesale.
//
const DailyRotateFile = require('marley-daily-rotate-file');
logger.configure({
  level: 'verbose',
  transports: [
    new DailyRotateFile(opts)
  ]
});
```

### Creating child loggers

You can create child loggers from existing loggers to pass metadata overrides:

``` js
const logger = marley.createLogger({
  transports: [
    new marley.transports.Console(),
  ]
});

const childLogger = logger.child({ requestId: '451' });
```
> `.child` is likely to be bugged if you're also extending the `Logger` class, due to some implementation details that make `this` keyword to point to unexpected things. Use with caution.

### Streams, `objectMode`, and `info` objects

In `marley`, both `Logger` and `Transport` instances are treated as
[`objectMode`](https://nodejs.org/api/stream.html#stream_object_mode)
streams that accept an `info` object.

The `info` parameter provided to a given format represents a single log
message. The object itself is mutable. Every `info` must have at least the
`level` and `message` properties:

``` js
const info = {
  level: 'info',                 // Level of the logging message
  message: 'Hey! Log something?' // Descriptive message being logged.
};
```

Properties **besides level and message** are considered as "`meta`". i.e.:

``` js
const { level, message, ...meta } = info;
```

Several of the formats in `logform` itself add additional properties:

| Property    | Format added by | Description |
| ----------- | --------------- | ----------- |
| `splat`     | `splat()`       | String interpolation splat for `%d %s`-style messages. |
| `timestamp` | `timestamp()`   |  timestamp the message was received. |
| `label`     | `label()`       | Custom label associated with each message. |
| `ms`        | `ms()`          | Number of milliseconds since the previous log message. |

As a consumer you may add whatever properties you wish – _internal state is
maintained by `Symbol` properties:_

- `Symbol.for('level')` _**(READ-ONLY)**:_ equal to `level` property.
  **Is treated as immutable by all code.**
- `Symbol.for('message'):` complete string message set by "finalizing formats":
  - `json`
  - `logstash`
  - `printf`
  - `prettyPrint`
  - `simple`
- `Symbol.for('splat')`: additional string interpolation arguments. _Used
  exclusively by `splat()` format._

These Symbols are stored in another package: `triple-beam` so that all
consumers of `logform` can have the same Symbol reference. i.e.:

``` js
const { LEVEL, MESSAGE, SPLAT } = require('triple-beam');

console.log(LEVEL === Symbol.for('level'));
// true

console.log(MESSAGE === Symbol.for('message'));
// true

console.log(SPLAT === Symbol.for('splat'));
// true
```

> **NOTE:** any `{ message }` property in a `meta` object provided will
> automatically be concatenated to any `msg` already provided: For
> example the below will concatenate 'world' onto 'hello':
>
> ``` js
> logger.log('error', 'hello', { message: 'world' });
> logger.info('hello', { message: 'world' });
> ```

## Formats

Formats in `marley` can be accessed from `marley.format`. They are
implemented in [`logform`](https://github.com/marleyjs/logform), a separate
module from `marley`. This allows flexibility when writing your own transports
in case you wish to include a default format with your transport.

In modern versions of `node` template strings are very performant and are the
recommended way for doing most end-user formatting. If you want to bespoke
format your logs, `marley.format.printf` is for you:

``` js
const { createLogger, format, transports } = require('marley');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()]
});
```

To see what built-in formats are available and learn more about creating your
own custom logging formats, see [`logform`][logform].

### Combining formats

Any number of formats may be combined into a single format using
`format.combine`. Since `format.combine` takes no `opts`, as a convenience it
returns pre-created instance of the combined format.

``` js
const { createLogger, format, transports } = require('marley');
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    prettyPrint()
  ),
  transports: [new transports.Console()]
})

logger.log({
  level: 'info',
  message: 'What time is the testing at?'
});
// Outputs:
// { level: 'info',
//   message: 'What time is the testing at?',
//   label: 'right meow!',
//   timestamp: '2017-09-30T03:57:26.875Z' }
```

### String interpolation

The `log` method provides the string interpolation using [util.format]. **It
must be enabled using `format.splat()`.**

Below is an example that defines a format with string interpolation of
messages using `format.splat` and then serializes the entire `info` message
using `format.simple`.

``` js
const { createLogger, format, transports } = require('marley');
const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [new transports.Console()]
});

// info: test message my string {}
logger.log('info', 'test message %s', 'my string');

// info: test message 123 {}
logger.log('info', 'test message %d', 123);

// info: test message first second {number: 123}
logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
```

### Filtering `info` Objects

If you wish to filter out a given `info` Object completely when logging then
simply return a falsey value.

``` js
const { createLogger, format, transports } = require('marley');

// Ignore log messages if they have { private: true }
const ignorePrivate = format((info, opts) => {
  if (info.private) { return false; }
  return info;
});

const logger = createLogger({
  format: format.combine(
    ignorePrivate(),
    format.json()
  ),
  transports: [new transports.Console()]
});

// Outputs: {"level":"error","message":"Public error to share"}
logger.log({
  level: 'error',
  message: 'Public error to share'
});

// Messages with { private: true } will not be written when logged.
logger.log({
  private: true,
  level: 'error',
  message: 'This is super secret - hide it.'
});
```

Use of `format.combine` will respect any falsey values return and stop
evaluation of later formats in the series. For example:

``` js
const { format } = require('marley');
const { combine, timestamp, label } = format;

const willNeverThrow = format.combine(
  format(info => { return false })(), // Ignores everything
  format(info => { throw new Error('Never reached') })()
);
```

### Creating custom formats

Formats are prototypal objects (i.e. class instances) that define a single
method: `transform(info, opts)` and return the mutated `info`:

- `info`: an object representing the log message.
- `opts`: setting specific to the current instance of the format.

They are expected to return one of two things:

- **An `info` Object** representing the modified `info` argument. Object
references need not be preserved if immutability is preferred. All current
built-in formats consider `info` mutable, but [immutablejs] is being
considered for future releases.
- **A falsey value** indicating that the `info` argument should be ignored by the
caller. (See: [Filtering `info` Objects](#filtering-info-objects)) below.

`marley.format` is designed to be as simple as possible. To define a new
format, simply pass it a `transform(info, opts)` function to get a new
`Format`.

The named `Format` returned can be used to create as many copies of the given
`Format` as desired:

``` js
const { format } = require('marley');

const volume = format((info, opts) => {
  if (opts.yell) {
    info.message = info.message.toUpperCase();
  } else if (opts.whisper) {
    info.message = info.message.toLowerCase();
  }

  return info;
});

// `volume` is now a function that returns instances of the format.
const scream = volume({ yell: true });
console.dir(scream.transform({
  level: 'info',
  message: `sorry for making you YELL in your head!`
}, scream.options));
// {
//   level: 'info'
//   message: 'SORRY FOR MAKING YOU YELL IN YOUR HEAD!'
// }

// `volume` can be used multiple times to create different formats.
const whisper = volume({ whisper: true });
console.dir(whisper.transform({
  level: 'info',
  message: `WHY ARE THEY MAKING US YELL SO MUCH!`
}, whisper.options));
// {
//   level: 'info'
//   message: 'why are they making us yell so much!'
// }
```

## Logging Levels

Logging levels in `marley` conform to the severity ordering specified by
[RFC5424]: _severity of all levels is assumed to be numerically **ascending**
from most important to least important._

Each `level` is given a specific integer priority. The higher the priority the
more important the message is considered to be, and the lower the
corresponding integer priority.  For example, as specified exactly in RFC5424
the `syslog` levels are prioritized from 0 to 7 (highest to lowest).

```js
{
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}
```

Similarly, `npm` logging levels are prioritized from 0 to 6 (highest to
lowest):

``` js
{
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}
```

If you do not explicitly define the levels that `marley` should use, the
`npm` levels above will be used.

### Using Logging Levels

Setting the level for your logging message can be accomplished in one of two
ways. You can pass a string representing the logging level to the log() method
or use the level specified methods defined on every marley Logger.

``` js
//
// Any logger instance
//
logger.log('silly', "127.0.0.1 - there's no place like home");
logger.log('debug', "127.0.0.1 - there's no place like home");
logger.log('verbose', "127.0.0.1 - there's no place like home");
logger.log('info', "127.0.0.1 - there's no place like home");
logger.log('warn', "127.0.0.1 - there's no place like home");
logger.log('error', "127.0.0.1 - there's no place like home");
logger.info("127.0.0.1 - there's no place like home");
logger.warn("127.0.0.1 - there's no place like home");
logger.error("127.0.0.1 - there's no place like home");

//
// Default logger
//
marley.log('info', "127.0.0.1 - there's no place like home");
marley.info("127.0.0.1 - there's no place like home");
```

`marley` allows you to define a `level` property on each transport which
specifies the **maximum** level of messages that a transport should log. For
example, using the `syslog` levels you could log only `error` messages to the
console and everything `info` and below to a file (which includes `error`
messages):

``` js
const logger = marley.createLogger({
  levels: marley.config.syslog.levels,
  transports: [
    new marley.transports.Console({ level: 'error' }),
    new marley.transports.File({
      filename: 'combined.log',
      level: 'info'
    })
  ]
});
```

You may also dynamically change the log level of a transport:

``` js
const transports = {
  console: new marley.transports.Console({ level: 'warn' }),
  file: new marley.transports.File({ filename: 'combined.log', level: 'error' })
};

const logger = marley.createLogger({
  transports: [
    transports.console,
    transports.file
  ]
});

logger.info('Will not be logged in either transport!');
transports.console.level = 'info';
transports.file.level = 'info';
logger.info('Will be logged in both transports!');
```

`marley` supports customizable logging levels, defaulting to npm style
logging levels. Levels must be specified at the time of creating your logger.

### Using Custom Logging Levels

In addition to the predefined `npm`, `syslog`, and `cli` levels available in
`marley`, you can also choose to define your own:

``` js
const myCustomLevels = {
  levels: {
    foo: 0,
    bar: 1,
    baz: 2,
    foobar: 3
  },
  colors: {
    foo: 'blue',
    bar: 'green',
    baz: 'yellow',
    foobar: 'red'
  }
};

const customLevelLogger = marley.createLogger({
  levels: myCustomLevels.levels
});

customLevelLogger.foobar('some foobar level-ed message');
```

Although there is slight repetition in this data structure, it enables simple
encapsulation if you do not want to have colors. If you do wish to have
colors, in addition to passing the levels to the Logger itself, you must make
marley aware of them:

``` js
marley.addColors(myCustomLevels.colors);
```

This enables loggers using the `colorize` formatter to appropriately color and style
the output of custom levels.

Additionally, you can also change background color and font style.
For example,
``` js
baz: 'italic yellow',
foobar: 'bold red cyanBG'
```

Possible options are below.

* Font styles: `bold`, `dim`, `italic`, `underline`, `inverse`, `hidden`,
  `strikethrough`.

* Font foreground colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`,
  `cyan`, `white`, `gray`, `grey`.

* Background colors: `blackBG`, `redBG`, `greenBG`, `yellowBG`, `blueBG`
  `magentaBG`, `cyanBG`, `whiteBG`

### Colorizing Standard logging levels

To colorize the standard logging level add
```js
marley.format.combine(
  marley.format.colorize(),
  marley.format.simple()
);
```
where `marley.format.simple()` is whatever other formatter you want to use.  The `colorize` formatter must come before any formatters adding text you wish to color.

### Colorizing full log line when json formatting logs

To colorize the full log line with the json formatter you can apply the following

```js
marley.format.combine(
  marley.format.json(),
  marley.format.colorize({ all: true })
);
```

## Transports

There are several [core transports] included in  `marley`, which leverage the
built-in networking and file I/O offered by Node.js core. In addition, there
are [additional transports] written by members of the community.

## Multiple transports of the same type

It is possible to use multiple transports of the same type e.g.
`marley.transports.File` when you construct the transport.

``` js
const logger = marley.createLogger({
  transports: [
    new marley.transports.File({
      filename: 'combined.log',
      level: 'info'
    }),
    new marley.transports.File({
      filename: 'errors.log',
      level: 'error'
    })
  ]
});
```

If you later want to remove one of these transports you can do so by using the
transport itself. e.g.:

``` js
const combinedLogs = logger.transports.find(transport => {
  return transport.filename === 'combined.log'
});

logger.remove(combinedLogs);
```

## Adding Custom Transports

Adding a custom transport is easy. All you need to do is accept any options
you need, implement a log() method, and consume it with `marley`.

``` js
const Transport = require('marley-transport');
const util = require('util');

//
// Inherit from `marley-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class YourCustomTransport extends Transport {
  constructor(opts) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Perform the writing to the remote service
    callback();
  }
};
```

## Common Transport options

As every transport inherits from [marley-transport], it's possible to set
a custom format and a custom log level on each transport separately:

``` js
const logger = marley.createLogger({
  transports: [
    new marley.transports.File({
      filename: 'error.log',
      level: 'error',
      format: marley.format.json()
    }),
    new marley.transports.Http({
      level: 'warn',
      format: marley.format.json()
    }),
    new marley.transports.Console({
      level: 'info',
      format: marley.format.combine(
        marley.format.colorize(),
        marley.format.simple()
      )
    })
  ]
});
```

## Exceptions

### Handling Uncaught Exceptions with marley

With `marley`, it is possible to catch and log `uncaughtException` events
from your process. With your own logger instance you can enable this behavior
when it's created or later on in your applications lifecycle:

``` js
const { createLogger, transports } = require('marley');

// Enable exception handling when you create your logger.
const logger = createLogger({
  transports: [
    new transports.File({ filename: 'combined.log' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' })
  ]
});

// Or enable it later on by adding a transport or using `.exceptions.handle`
const logger = createLogger({
  transports: [
    new transports.File({ filename: 'combined.log' })
  ]
});

// Call exceptions.handle with a transport to handle exceptions
logger.exceptions.handle(
  new transports.File({ filename: 'exceptions.log' })
);
```

If you want to use this feature with the default logger, simply call
`.exceptions.handle()` with a transport instance.

``` js
//
// You can add a separate exception logger by passing it to `.exceptions.handle`
//
marley.exceptions.handle(
  new marley.transports.File({ filename: 'path/to/exceptions.log' })
);

//
// Alternatively you can set `handleExceptions` to true when adding transports
// to marley.
//
marley.add(new marley.transports.File({
  filename: 'path/to/combined.log',
  handleExceptions: true
}));
```

### To Exit or Not to Exit

By default, marley will exit after logging an uncaughtException. If this is
not the behavior you want, set `exitOnError = false`

``` js
const logger = marley.createLogger({ exitOnError: false });

//
// or, like this:
//
logger.exitOnError = false;
```

When working with custom logger instances, you can pass in separate transports
to the `exceptionHandlers` property or set `handleExceptions` on any
transport.

##### Example 1

``` js
const logger = marley.createLogger({
  transports: [
    new marley.transports.File({ filename: 'path/to/combined.log' })
  ],
  exceptionHandlers: [
    new marley.transports.File({ filename: 'path/to/exceptions.log' })
  ]
});
```

##### Example 2

``` js
const logger = marley.createLogger({
  transports: [
    new marley.transports.Console({
      handleExceptions: true
    })
  ],
  exitOnError: false
});
```

The `exitOnError` option can also be a function to prevent exit on only
certain types of errors:

``` js
function ignoreEpipe(err) {
  return err.code !== 'EPIPE';
}

const logger = marley.createLogger({ exitOnError: ignoreEpipe });

//
// or, like this:
//
logger.exitOnError = ignoreEpipe;
```

## Rejections

### Handling Uncaught Promise Rejections with marley

With `marley`, it is possible to catch and log `unhandledRejection` events
from your process. With your own logger instance you can enable this behavior
when it's created or later on in your applications lifecycle:

``` js
const { createLogger, transports } = require('marley');

// Enable rejection handling when you create your logger.
const logger = createLogger({
  transports: [
    new transports.File({ filename: 'combined.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'rejections.log' })
  ]
});

// Or enable it later on by adding a transport or using `.rejections.handle`
const logger = createLogger({
  transports: [
    new transports.File({ filename: 'combined.log' })
  ]
});

// Call rejections.handle with a transport to handle rejections
logger.rejections.handle(
  new transports.File({ filename: 'rejections.log' })
);
```

If you want to use this feature with the default logger, simply call
`.rejections.handle()` with a transport instance.

``` js
//
// You can add a separate rejection logger by passing it to `.rejections.handle`
//
marley.rejections.handle(
  new marley.transports.File({ filename: 'path/to/rejections.log' })
);

//
// Alternatively you can set `handleRejections` to true when adding transports
// to marley.
//
marley.add(new marley.transports.File({
  filename: 'path/to/combined.log',
  handleRejections: true
}));
```

## Profiling

In addition to logging messages and metadata, `marley` also has a simple
profiling mechanism implemented for any logger:

``` js
//
// Start profile of 'test'
//
logger.profile('test');

setTimeout(function () {
  //
  // Stop profile of 'test'. Logging will now take place:
  //   '17 Jan 21:00:00 - info: test duration=1000ms'
  //
  logger.profile('test');
}, 1000);
```

Also you can start a timer and keep a reference that you can call `.done()`
on:

``` js
 // Returns an object corresponding to a specific timing. When done
 // is called the timer will finish and log the duration. e.g.:
 //
 const profiler = logger.startTimer();
 setTimeout(function () {
   profiler.done({ message: 'Logging message' });
 }, 1000);
```

All profile messages are set to 'info' level by default, and both message and
metadata are optional.  For individual profile messages, you can override the default log level by supplying a metadata object with a `level` property:

```js
logger.profile('test', { level: 'debug' });
```

## Querying Logs

`marley` supports querying of logs with Loggly-like options. [See Loggly
Search API](https://www.loggly.com/docs/api-retrieving-data/). Specifically:
`File`, `Couchdb`, `Redis`, `Loggly`, `Nssocket`, and `Http`.

``` js
const options = {
  from: new Date() - (24 * 60 * 60 * 1000),
  until: new Date(),
  limit: 10,
  start: 0,
  order: 'desc',
  fields: ['message']
};

//
// Find items logged between today and yesterday.
//
logger.query(options, function (err, results) {
  if (err) {
    /* TODO: handle me */
    throw err;
  }

  console.log(results);
});
```

## Streaming Logs
Streaming allows you to stream your logs back from your chosen transport.

``` js
//
// Start at the end.
//
marley.stream({ start: -1 }).on('log', function(log) {
  console.log(log);
});
```

## Further Reading

### Using the Default Logger

The default logger is accessible through the `marley` module directly. Any
method that you could call on an instance of a logger is available on the
default logger:

``` js
const marley = require('marley');

marley.log('info', 'Hello distributed log files!');
marley.info('Hello again distributed logs');

marley.level = 'debug';
marley.log('debug', 'Now my debug messages are written to console!');
```

By default, no transports are set on the default logger. You must
add or remove transports via the `add()` and `remove()` methods:

``` js
const files = new marley.transports.File({ filename: 'combined.log' });
const console = new marley.transports.Console();

marley.add(console);
marley.add(files);
marley.remove(console);
```

Or do it with one call to configure():

``` js
marley.configure({
  transports: [
    new marley.transports.File({ filename: 'somefile.log' })
  ]
});
```

For more documentation about working with each individual transport supported
by `marley` see the [`marley` Transports](docs/transports.md) document.

### Awaiting logs to be written in `marley`

Often it is useful to wait for your logs to be written before exiting the
process. Each instance of `marley.Logger` is also a [Node.js stream]. A
`finish` event will be raised when all logs have flushed to all transports
after the stream has been ended.

``` js
const transport = new marley.transports.Console();
const logger = marley.createLogger({
  transports: [transport]
});

logger.on('finish', function (info) {
  // All `info` log messages has now been logged
});

logger.info('CHILL WINSTON!', { seriously: true });
logger.end();
```

It is also worth mentioning that the logger also emits an 'error' event
if an error occurs within the logger itself which
you should handle or suppress if you don't want unhandled exceptions:

``` js
//
// Handle errors originating in the logger itself
//
logger.on('error', function (err) { /* Do Something */ });
```

### Working with multiple Loggers in marley

Often in larger, more complex, applications it is necessary to have multiple
logger instances with different settings. Each logger is responsible for a
different feature area (or category). This is exposed in `marley` in two
ways: through `marley.loggers` and instances of `marley.Container`. In fact,
`marley.loggers` is just a predefined instance of `marley.Container`:

``` js
const marley = require('marley');
const { format } = marley;
const { combine, label, json } = format;

//
// Configure the logger for `category1`
//
marley.loggers.add('category1', {
  format: combine(
    label({ label: 'category one' }),
    json()
  ),
  transports: [
    new marley.transports.Console({ level: 'silly' }),
    new marley.transports.File({ filename: 'somefile.log' })
  ]
});

//
// Configure the logger for `category2`
//
marley.loggers.add('category2', {
  format: combine(
    label({ label: 'category two' }),
    json()
  ),
  transports: [
    new marley.transports.Http({ host: 'localhost', port:8080 })
  ]
});
```

Now that your loggers are setup, you can require marley _in any file in your
application_ and access these pre-configured loggers:

``` js
const marley = require('marley');

//
// Grab your preconfigured loggers
//
const category1 = marley.loggers.get('category1');
const category2 = marley.loggers.get('category2');

category1.info('logging to file and console transports');
category2.info('logging to http transport');
```

If you prefer to manage the `Container` yourself, you can simply instantiate one:

``` js
const marley = require('marley');
const { format } = marley;
const { combine, label, json } = format;

const container = new marley.Container();

container.add('category1', {
  format: combine(
    label({ label: 'category one' }),
    json()
  ),
  transports: [
    new marley.transports.Console({ level: 'silly' }),
    new marley.transports.File({ filename: 'somefile.log' })
  ]
});

const category1 = container.get('category1');
category1.info('logging to file and console transports');
```

### Routing Console transport messages to the console instead of stdout and stderr

By default the `marley.transports.Console` transport sends messages to `stdout` and `stderr`. This
is fine in most situations; however, there are some cases where this isn't desirable, including:

- Debugging using VSCode and attaching to, rather than launching, a Node.js process
- Writing JSON format messages in AWS Lambda
- Logging during Jest tests with the `--silent` option

To make the transport log use `console.log()`, `console.warn()` and `console.error()`
instead, set the `forceConsole` option to `true`:

```js
const logger = marley.createLogger({
  level: 'info',
  transports: [new marley.transports.Console({ forceConsole: true })]
});
```

## Installation

``` bash
npm install marley
```

``` bash
yarn add marley
```

## Run Tests

All of the marley tests are written with [`mocha`][mocha], [`nyc`][nyc], and
[`assume`][assume].  They can be run with `npm`.

``` bash
npm test
```

#### Author: [Charlie Robbins]
#### Contributors: [Jarrett Cruger], [David Hyde], [Chris Alderson]

[Transports]: #transports
[Logging levels]: #logging-levels
[Formats]: #formats
[Using custom logging levels]: #using-custom-logging-levels
[Adding Custom Transports]: #adding-custom-transports
[core transports]: docs/transports.md#marley-core
[additional transports]: docs/transports.md#additional-transports

[RFC5424]: https://tools.ietf.org/html/rfc5424
[util.format]: https://nodejs.org/dist/latest/docs/api/util.html#util_util_format_format_args
[mocha]: https://mochajs.org
[nyc]: https://github.com/istanbuljs/nyc
[assume]: https://github.com/bigpipe/assume
[logform]: https://github.com/marleyjs/logform#readme
[marley-transport]: https://github.com/marleyjs/marley-transport

[Read the `marley@2.x` documentation]: https://github.com/marleyjs/marley/tree/2.x

[quick-example]: https://github.com/marleyjs/marley/blob/master/examples/quick-start.js
[examples]: https://github.com/marleyjs/marley/tree/master/examples

[Charlie Robbins]: http://github.com/indexzero
[Jarrett Cruger]: https://github.com/jcrugzz
[David Hyde]: https://github.com/dabh
[Chris Alderson]: https://github.com/chrisalderson