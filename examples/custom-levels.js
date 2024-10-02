'use strict';

const marley = require('../');

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
  level: 'foobar',
  levels: myCustomLevels.levels,
  transports: [
    new marley.transports.Console()
  ]
});

customLevelLogger.foobar('some foobar level-ed message');
customLevelLogger.baz('some baz level-ed message');
customLevelLogger.bar('some bar level-ed message');
customLevelLogger.foo('some foo level-ed message');
