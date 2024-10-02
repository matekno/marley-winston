# Upgrading to `marley@3.0.0`

> This document represents a **living guide** on upgrading to `marley@3`.
> Much attention has gone into the details, but if you are having trouble
> upgrading to `marley@3.0.0` **PLEASE** open an issue so we can improve this
> guide! 

- [Breaking changes]
   - [Top-level `marley.*` API]
   - [Transports]
   - [`marley.Container` and `marley.loggers`]
   - [`marley.Logger`]
   - [Exceptions & exception handling]
   - [Other minor breaking changes]
- [Upgrading to `marley.format`]
   - [Removed `marley.Logger` formatting options]
   - [Removed `marley.transports.{File,Console,Http}` formatting options]
   - [Migrating `filters` and `rewriters` to `formats` in `marley@3`]
- [Modularity: `marley-transport`, `logform` and more]

## Breaking changes

### Top-level `marley.*` API
- `marley.Logger` has been replaced with `marley.createLogger`.
- `marley.setLevels` has been removed. Levels are frozen at the time of Logger creation.
- Setting the level on the default `marley` logger no longer sets the level on the transports associated with the default `marley` logger.
- The default logger exposed by `require('marley')` no longer has default `Console` transports, 
and leaving it without transports may cause a high memory usage issue.

### Transports
- `marley.transports.Memory` was removed. Use any Node.js `stream.Writeable` with a large `highWaterMark` instance instead.
- When writing transports use `marley-transport` instead of
  `marley.Transport`.
- Many formatting options that were previously configurable on transports 
  (e.g. `json`, `raw`, `colorize`, `prettyPrint`, `timestamp`, `logstash`, 
  `align`) should now be set by adding the appropriate formatter instead.
  _(See: "Removed `marley.transports.{File,Console,Http}` formatting options"
  below)_ 
- In `marley.transports.Console`, output for all log levels are now sent to stdout by default.
    - `stderrLevels` option now defaults to `[]`.
    - `debugStdout` option has been removed.

### `marley.Container` and `marley.loggers`
- `marley.Container` instances no longer have default `Console` transports.
Failing to add any transports may cause a high memory usage issue.
- `marley.Container.prototype.add` no longer does crazy options parsing. Implementation inspired by [segmentio/marley-logger](https://github.com/segmentio/marley-logger/blob/master/lib/index.js#L20-L43)

### `marley.Logger`
- **Do not use** `new marley.Logger(opts)` – it has been removed for
  improved performance. Use `marley.createLogger(opts)` instead.

- `marley.Logger.log` and level-specific methods (`.info`, `.error`, etc)
  **no longer accepts a callback.** The vast majority of use cases for this
  feature was folks awaiting _all logging_ to complete, not just a single
  logging message. To accomplish this:

``` js
logger.log('info', 'some message');
logger.on('finish', () => process.exit());
logger.end();
```

- `marley.Logger.add` no longer accepts prototypes / classes. Pass
  **an instance of our transport instead.**

``` js
// DON'T DO THIS. It will no longer work
logger.add(marley.transports.Console);

// Do this instead.
logger.add(new marley.transports.Console());
```

- `marley.Logger` will no longer do automatic splat interpolation by default.
  Be sure to use `format.splat()` to enable this functionality.
- `marley.Logger` will no longer respond with an error when logging with no
  transports.
- `marley.Logger` will no longer respond with an error if the same transports
  are added twice.
- `Logger.prototype.stream`
  - `options.transport` is removed. Use the transport instance on the logger
    directly.
- `Logger.prototype.query`
  - `options.transport` is removed. Use the transport instance on the logger 
    directly.
- `Logger.paddings` was removed.

### Exceptions & exception handling
- `marley.exception` has been removed. Use:
``` js
const exception = marley.ExceptionHandler();
```
- `humanReadableUnhandledException` is now the default exception format.
- `.unhandleExceptions()` will no longer modify transports state, merely just add / remove the `process.on('uncaughtException')` handler.
   - Call close on any explicit `ExceptionHandlers`.
   - Set `handleExceptions = false` on all transports.

### Other minor breaking changes
- `marley.hash` was removed.
- `marley.common.pad` was removed.
- `marley.common.serialized` was removed (use `marley-compat`).
- `marley.common.log` was removed (use `marley-compat`).
- `marley.paddings` was removed.

## Upgrading to `marley.format`
The biggest issue with `marley@2` and previous major releases was that any
new formatting options required changes to `marley` itself. All formatting is
now handled by **formats**. 

Custom formats can now be created with no changes to `marley` core.
_We encourage you to consider a custom format before opening an issue._

### Removed `marley.Logger` formatting options:
- The default output format is now `format.json()`.
- `filters`: Use a custom `format`. See: [Filters and Rewriters] below.
- `rewriters`: Use a custom `format`. See: [Filters and Rewriters] below.

### Removed `marley.transports.{File,Console,Http}` formatting options
- `stringify`: Use a [custom format].
- `formatter`: Use a [custom format].
- `json`: Use `format.json()`.
- `raw`: Use `format.json()`.
- `label`: Use `format.label()`.
- `logstash`: Use `format.logstash()`.
- `prettyPrint`: Use `format.prettyPrint()` or a [custom format].
   - `depth` is an option provided to `format.prettyPrint()`.
- `colorize`: Use `format.colorize()`.
- `timestamp`: Use `format.timestamp()`.
- `logstash`: Use `format.logstash()`.
- `align`: Use `format.align()`.
- `showLevel`: Use a [custom format].

### Migrating `filters` and `rewriters` to `formats` in `marley@3`

In `marley@3.x.x` `info` objects are considered mutable. The API _combined
formatters and rewriters into a single, new concept:_ **formats**. 

#### Filters

If you are looking to upgrade your `filter` behavior please read on. In
`marley@2.x` this **filter** behavior:

``` js
const isSecret = /super secret/;
const logger = new marley.Logger(options);
logger.filters.push(function(level, msg, meta) {
  return msg.replace(isSecret, 'su*** se****');
});

// Outputs: {"level":"error","message":"Public error to share"}
logger.error('Public error to share');

// Outputs: {"level":"error","message":"This is su*** se**** - hide it."}
logger.error('This is super secret - hide it.');
```

Can be modeled as a **custom format** that you combine with other formats:

``` js
const { createLogger, format, transports } = require('marley');

// Ignore log messages if the have { private: true }
const isSecret = /super secret/;
const filterSecret = format((info, opts) => {
  info.message = info.message.replace(isSecret, 'su*** se****');
  return info;
});

const logger = createLogger({
  format: format.combine(
    filterSecret(),
    format.json()
  ),
  transports: [new transports.Console()]
});

// Outputs: {"level":"error","message":"Public error to share"}
logger.log({
  level: 'error',
  message: 'Public error to share'
});

// Outputs: {"level":"error","message":"This is su*** se**** - hide it."}
logger.log({
  level: 'error',
  message: 'This is super secret - hide it.'
});
```

#### Rewriters

If you are looking to upgrade your `rewriter` behavior please read on. In
`marley@2.x` this **rewriter** behavior:

``` js
const logger = new marley.Logger(options);
logger.rewriters.push(function(level, msg, meta) {
  if (meta.creditCard) {
    meta.creditCard = maskCardNumbers(meta.creditCard)
  }

  return meta;
});

logger.info('transaction ok', { creditCard: 123456789012345 });
```

Can be modeled as a **custom format** that you combine with other formats:

``` js 
const maskFormat = marley.format(info => {
  // You can CHANGE existing property values
  if (info.creditCard) {
    info.creditCard = maskCardNumbers(info.creditCard);
  }

  // You can also ADD NEW properties if you wish
  info.hasCreditCard = !!info.creditCard;

  return info;
});

const logger = marley.createLogger({
  format: marley.format.combine(
    maskFormat(),
    marley.format.json()
  )
});

logger.info('transaction ok', { creditCard: 123456789012345 });
```

See [examples/format-mutate.js](/examples/format-mutate.js) for a complete
end-to-end example that covers both filtering and rewriting behavior in
`marley@2.x`.

## Modularity: `marley-transport`, `logform` and more...

As of `marley@3.0.0` the project has been broken out into a few modules:

- [marley-transport]: `Transport` stream implementation & legacy `Transport`
  wrapper.
- [logform]: All formats exports through `marley.format`. 
- `LEVEL` and `MESSAGE` symbols exposed through [triple-beam].
- [Shared test suite][abstract-marley-transport] for community transports. 

Let's dig in deeper. The example below has been annotated to demonstrate the different packages that compose the example itself:

``` js
const { createLogger, transports, format } = require('marley');
const Transport = require('marley-transport');
const logform = require('logform');
const { combine, timestamp, label, printf } = logform.format;

// marley.format is require('logform')
console.log(logform.format === format) // true

const logger = createLogger({
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    printf(nfo => {
      return `${nfo.timestamp} [${nfo.label}] ${nfo.level}: ${nfo.message}`;
    })
  ),
  transports: [new transports.Console()]
});
```

[Breaking changes]: #breaking-changes
[Top-level `marley.*` API]: #top-level-marley-api
[Transports]: #transports
[`marley.Container` and `marley.loggers`]: #marleycontainer-and-marleyloggers
[`marley.Logger`]: #marleylogger
[Exceptions & exception handling]: #exceptions--exception-handling
[Other minor breaking changes]: #other-minor-breaking-changes
[Upgrading to `marley.format`]: #upgrading-to-marleyformat
[Removed `marley.Logger` formatting options]: #removed-marleylogger-formatting-options
[Removed `marley.transports.{File,Console,Http}` formatting options]: #removed-marleytransportsfileconsolehttp-formatting-options
[Migrating `filters` and `rewriters` to `formats` in `marley@3`]: #migrating-filters-and-rewriters-to-formats-in-marley3
[Modularity: `marley-transport`, `logform` and more]: #modularity-marley-transport-logform-and-more

[Filters and Rewriters]: #migrating-filters-and-rewriters-to-formats-in-marley3
[custom format]: /README.md#creating-custom-formats

[marley-transport]: https://github.com/marleyjs/marley-transport
[logform]: https://github.com/marleyjs/logform
[triple-beam]: https://github.com/marleyjs/triple-beam
[abstract-marley-transport]: https://github.com/marleyjs/abstract-marley-transport

