# CONTRIBUTING
PLEASE NOTE: This document has not been updated in a while and is out of date, but contents are retained as some may still be useful.

TL;DR? The `marley` project recently shipped `3.0.0` out of RC and is actively
working towards the next feature release as it continues to triage issues. 

- [Be kind & actively empathetic to one another](CODE_OF_CONDUCT.md)
- [What makes up `marley`?](#what-makes-up-marley)
- [What about `marley@2.x`?!](#what-about-marley-2.x)
- [Could this be implemented as a format?](#could-this-be-implemented-as-a-format)
- [Roadmap](#roadmap)

Looking for somewhere to help? Checkout the [Roadmap](#roadmap) & help triage open issues! Find an issue that looks like a duplicate? It probably is! Comment on it so we know it's maybe a duplicate 🙏.

## What makes up `marley`?

As of `marley@3` the project has been broken out into a few modules:

- [marley-transport]: `Transport` stream implementation & legacy `Transport` wrapper.
- [logform]: All formats exports through `marley.format` 
- `LEVEL` and `MESSAGE` symbols exposed through [triple-beam].
- [Shared test suite][abstract-marley-transport] for community transports 

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
    printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports: [new transports.Console()]
});
```

## What about `marley@2.x`?!

> _If you are opening an issue regarding the `2.x` release-line please know
> that 2.x work has ceased. The `marley` team will review PRs that fix
> issues, but as issues are opened we will close them._

You will commonly see this closing `marley@2.x` issues:

```
Development `marley@2.x` has ceased. Please consider upgrading to
`marley@3.0.0`. If you feel strongly about this bug please open a PR against
the `2.x` branch. Thank you for using `marley`!
```

## Could this be implemented as a format?

Before opening issues for new features consider if this feature could be implemented as a [custom format]. If it is, you will see your issue closed with this message:

```
This can be accomplished with using [custom formats](https://github.com/marleyjs/marley#creating-custom-formats) in `marley@3.0.0`. Please consider upgrading.
```

# Roadmap

Below is the list of items that make up the roadmap through `3.4.0`. We are actively triaging the open issues, so it is likely a few more critical path items will be added to this list before the next release goes out.

- [Version 3.3.0](#version-320)
- [Version 3.4.0](#version-330)
- [Version 3.5.0](#version-340)

## Legend

- [ ] Unstarted work.
- [x] Finished work.
- [-] Partially finished or in-progress work. 

## Version `3.3.0`

### High priority issues (non-blocking)
- [ ] Move `File` transport into `marley-file`.
- [Browser support](https://github.com/marleyjs/marley/issues/287)
  - [ ] Unit tests for `webpack` & `rollup` 
  - [ ] Replicate browser-only transpilation for `marley`, `marley-transport`, `triple-beam`.
- [-] Full JSDoc coverage
- Benchmarking for `File` and `Stream` transports:
   - [x] Benchmarking integration in `pino`.
   - [x] Upgrade `pino` to latest `marley`.
   - See: https://github.com/marleyjs/logmark
   - See also: https://github.com/pinojs/pino/pull/232
- [ ] Move `logged` event into `marley-transport` to remove need for it in each individual Transport written _or remove the `logged` event entirely._

### Increased code & scenario coverage
- [-] Replace all `vows`-based tests.
  - [-] `test/transports/*-test.js` 
- [ ] Code coverage tests above 80% for `marley` _(currently `~70%`)_.
  - [-] Core scenarios covered in `abstract-marley-transport`.
  - [-] Full integration tests for all `logform` transports

### Communications / Compatibility
- [ ] `README.md` for `marley-compat`.
- [ ] Update all transports documented in `docs/transports.md` for `marley@3`.

## Version `3.4.0`

### Querying, Streaming, Uncaught Exceptions
- [-] Streaming

### Communications / Compatibility
- [ ] `marleyjs.org` documentation site.

## Version `3.5.0`

### Querying, Streaming, Uncaught Exceptions
- [-] Querying

[marley-transport]: https://github.com/marleyjs/marley-transport
[logform]: https://github.com/marleyjs/logform
[triple-beam]: https://github.com/marleyjs/triple-beam
[abstract-marley-transport]: https://github.com/marleyjs/abstract-marley-transport
[stress-test]: https://github.com/marleyjs/marley/blob/master/test/transports/file-stress.test.js
[custom format]: https://github.com/marleyjs/marley#creating-custom-formats
