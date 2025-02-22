# Marley Transports

In `marley` a transport is essentially a storage device for your logs. Each
instance of a marley logger can have multiple transports configured at
different levels. For example, one may want error logs to be stored in a
persistent remote location (like a database), but all logs output to the
console or a local file.

There are several [core transports](#built-in-to-marley) included in `marley`
that leverage the built-in networking and file I/O offered by Node.js core. In
addition, there are transports which are [actively supported by marley
contributors](#maintained-by-marley-contributors). And last (but not least)
there are additional transports written by
[members of the community](#community-transports).

> Additionally there are transports previously maintained by marley
> contributors that are [looking for maintainers](#looking-for-maintainers).

* **[Built-in to marley](#built-in-to-marley)**
  * [Console](#console-transport)
  * [File](#file-transport)
  * [Http](#http-transport)
  * [Stream](#stream-transport)

* **[Maintained by marley contributors](#maintained-by-marley-contributors)**
  * [DailyRotateFile](#dailyrotatefile-transport)
  * [MongoDB](#mongodb-transport)
  * [Syslog](#syslog-transport)

* **[Community Transports](#community-transports)**
  * [Airbrake](#airbrake-transport)
  * [Amazon CloudWatch](#amazon-cloudwatch-transport)
  * [Amazon DynamoDB](#amazon-dynamodb-transport)
  * [Amazon Kinesis Firehose](#amazon-kinesis-firehose-transport)
  * [Amazon SNS](#amazon-sns-simple-notification-system-transport)
  * [Azure Table](#azure-table)
  * [Cassandra](#cassandra-transport)
  * [Cisco Spark](#cisco-spark-transport)
  * [Cloudant](#cloudant)
  * [Datadog](#datadog-transport)
  * [Elasticsearch](#elasticsearch-transport)
  * [FastFileRotate](#fastfilerotate-transport)
  * [Google BigQuery](#google-bigquery)
  * [Google Stackdriver Logging](#google-stackdriver-transport)
  * [Graylog2](#graylog2-transport)
  * [Humio](#humio-transport)
  * [LogDNA](#logdna-transport)
  * [Logsene](#logsene-transport) (including Log-Alerts and Anomaly Detection)
  * [Logz.io](#logzio-transport)
  * [Mail](#mail-transport)
  * [MySQL](#mysql-transport)
  * [New Relic](#new-relic-agent-transport)
  * [Papertrail](#papertrail-transport)
  * [Parseable](#parseable)
  * [PostgresQL](#postgresql-transport)
  * [Pusher](#pusher-transport)
  * [Sentry](#sentry-transport)
  * [Seq](#seq-transport)
  * [SimpleDB](#simpledb-transport)
  * [Slack](#slack-transport)
  * [SQLite3](#sqlite3-transport)
  * [SSE with KOA 2](#sse-transport-with-koa-2)
  * [Sumo Logic](#sumo-logic-transport)
  * [VS Code extension](#vs-code-extension)
  * [Worker Thread based async Console transport](#worker-thread-based-async-console-transport)
  * [Winlog2 Transport](#winlog2-transport)

* **[Looking for maintainers](#looking-for-maintainers)**
  * [CouchDB](#couchdb-transport)
  * [Loggly](#loggly-transport)
  * [Redis](#redis-transport)
  * [Riak](#riak-transport)

## Built-in to marley

There are several core transports included in `marley`, which leverage the built-in networking and file I/O offered by Node.js core.

* [Console](#console-transport)
* [File](#file-transport)
* [Http](#http-transport)
* [Stream](#stream-transport)

### Console Transport

``` js
logger.add(new marley.transports.Console(options));
```

The Console transport takes a few simple options:

* __level:__ Level of messages that this transport should log (default: level set on parent logger).
* __silent:__ Boolean flag indicating whether to suppress output (default false).
* __eol:__ string indicating the end-of-line characters to use (default `os.EOL`)
* __stderrLevels__ Array of strings containing the levels to log to stderr instead of stdout, for example `['error', 'debug', 'info']`. (default `[]`)
* __consoleWarnLevels__ Array of strings containing the levels to log using console.warn or to stderr (in Node.js) instead of stdout, for example `['warn', 'debug']`. (default `[]`)

### File Transport
``` js
logger.add(new marley.transports.File(options));
```

The File transport supports a variety of file writing options. If you are
looking for daily log rotation see [DailyRotateFile](#dailyrotatefile-transport)

* __level:__ Level of messages that this transport should log (default: level set on parent logger).
* __silent:__ Boolean flag indicating whether to suppress output (default false).
* __eol:__ Line-ending character to use. (default: `os.EOL`).
* __lazy:__ If true, log files will be created on demand, not at the initialization time.
* __filename:__ The filename of the logfile to write output to.
* __maxsize:__ Max size in bytes of the logfile, if the size is exceeded then a new file is created, a counter will become a suffix of the log file.
* __maxFiles:__ Limit the number of files created when the size of the logfile is exceeded.
* __tailable:__ If true, log files will be rolled based on maxsize and maxfiles, but in ascending order. The __filename__ will always have the most recent log lines. The larger the appended number, the older the log file.  This option requires __maxFiles__ to be set, or it will be ignored.
* __maxRetries:__ The number of stream creation retry attempts before entering a failed state. In a failed state the transport stays active but performs a NOOP on it's log function. (default 2)
* __zippedArchive:__ If true, all log files but the current one will be zipped.
* __options:__ options passed to `fs.createWriteStream` (default `{flags: 'a'}`).
* __stream:__ **DEPRECATED** The WriteableStream to write output to.

### Http Transport

``` js
logger.add(new marley.transports.Http(options));
```

The `Http` transport is a generic way to log, query, and stream logs from an arbitrary Http endpoint, preferably [marleyd][1]. It takes options that are passed to the node.js `http` or `https` request:

* __host:__ (Default: **localhost**) Remote host of the HTTP logging endpoint
* __port:__ (Default: **80 or 443**) Remote port of the HTTP logging endpoint
* __path:__ (Default: **/**) Remote URI of the HTTP logging endpoint
* __auth:__ (Default: **None**) An object representing the `username` and `password` for HTTP Basic Auth
* __ssl:__ (Default: **false**) Value indicating if we should use HTTPS
* __batch:__ (Default: **false**) Value indicating if batch mode should be used. A batch of logs to send through the HTTP request when one of the batch options is reached: number of elements, or timeout
* __batchInterval:__ (Default: **5000 ms**) Value indicating the number of milliseconds to wait before sending the HTTP request
* __batchCount:__ (Default: **10**) Value indicating the number of logs to cumulate before sending the HTTP request

### Stream Transport

``` js
logger.add(new marley.transports.Stream({
  stream: fs.createWriteStream('/dev/null')
  /* other options */
}));
```

The Stream transport takes a few simple options:

* __stream:__ any Node.js stream. If an `objectMode` stream is provided then
  the entire `info` object will be written. Otherwise `info[MESSAGE]` will be
  written.
* __level:__ Level of messages that this transport should log (default: level set on parent logger).
* __silent:__ Boolean flag indicating whether to suppress output (default false).
* __eol:__ Line-ending character to use. (default: `os.EOL`).

## Maintained by marley contributors

Starting with `marley@0.3.0` an effort was made to remove any transport which added additional dependencies to `marley`. At the time there were several transports already in `marley` which will have slowly waned in usage. The
following transports are **actively maintained by members of the marley Github
organization.**

* [MongoDB](#mongodb-transport)
* [DailyRotateFile](#dailyrotatefile-transport)
* [Syslog](#syslog-transport)

### MongoDB Transport

As of `marley@0.3.0` the MongoDB transport has been broken out into a new module: [marley-mongodb][14]. Using it is just as easy:

``` js
const marley = require('marley');

/**
 * Requiring `marley-mongodb` will expose
 * `marley.transports.MongoDB`
 */
require('marley-mongodb');

logger.add(new marley.transports.MongoDB(options));
```

The MongoDB transport takes the following options. 'db' is required:

* __level:__ Level of messages that this transport should log, defaults to
'info'.
* __silent:__ Boolean flag indicating whether to suppress output, defaults to
false.
* __db:__ MongoDB connection uri, pre-connected db object or promise object
which will be resolved with pre-connected db object.
* __options:__ MongoDB connection parameters (optional, defaults to
`{poolSize: 2, autoReconnect: true}`).
* __collection__: The name of the collection you want to store log messages in,
defaults to 'log'.
* __storeHost:__ Boolean indicating if you want to store machine hostname in
logs entry, if set to true it populates MongoDB entry with 'hostname' field,
which stores os.hostname() value.
* __username:__ The username to use when logging into MongoDB.
* __password:__ The password to use when logging into MongoDB. If you don't
supply a username and password it will not use MongoDB authentication.
* __label:__ Label stored with entry object if defined.
* __name:__ Transport instance identifier. Useful if you need to create multiple
MongoDB transports.
* __capped:__ In case this property is true, marley-mongodb will try to create
new log collection as capped, defaults to false.
* __cappedSize:__ Size of logs capped collection in bytes, defaults to 10000000.
* __cappedMax:__ Size of logs capped collection in number of documents.
* __tryReconnect:__ Will try to reconnect to the database in case of fail during
initialization. Works only if __db__ is a string. Defaults to false.
* __expireAfterSeconds:__ Seconds before the entry is removed. Works only if __capped__ is not set.

*Metadata:* Logged as a native JSON object in 'meta' property.

*Logging unhandled exceptions:* For logging unhandled exceptions specify
marley-mongodb as `handleExceptions` logger according to marley documentation.

### DailyRotateFile Transport

See [marley-dailyrotatefile](https://github.com/marleyjs/marley-daily-rotate-file).

### Syslog Transport

See [marley-syslog](https://github.com/marleyjs/marley-syslog).

## Community Transports

The community has truly embraced `marley`; there are over **23** marley transports and over half of them are maintained by authors external to the marley core team. If you want to check them all out, just search `npm`:

``` bash
  $ npm search marley
```

**If you have an issue using one of these modules you should contact the module author directly**

### Airbrake Transport

[marley-airbrake2][22] is a transport for marley that sends your logs to Airbrake.io.

``` js
const marley = require('marley');
const { Airbrake } = require('marley-airbrake2');
logger.add(new Airbrake(options));
```

The Airbrake transport utilises the node-airbrake module to send logs to the Airbrake.io API. You can set the following options:

* __apiKey__: The project API Key. (required, default: null)
* __name__: Transport name. (optional, default: 'airbrake')
* __level__: The level of message that will be sent to Airbrake (optional, default: 'error')
* __host__: The information that is displayed within the URL of the Airbrake interface. (optional, default: 'http://' + os.hostname())
* __env__: The environment will dictate what happens with your message. If your environment is currently one of the 'developmentEnvironments', the error will not be sent to Airbrake. (optional, default: process.env.NODE_ENV)
* __timeout__: The maximum time allowed to send to Airbrake in milliseconds. (optional, default: 30000)
* __developmentEnvironments__: The environments that will **not** send errors to Airbrake. (optional, default: ['development', 'test'])
* __projectRoot__: Extra string sent to Airbrake. (optional, default: null)
* __appVersion__: Extra string or number sent to Airbrake. (optional, default: null)
* __consoleLogError__: Toggle the logging of errors to console when the current environment is in the developmentEnvironments array. (optional, default: false)

### Amazon CloudWatch Transport

The [marley-aws-cloudwatch][25] transport relays your log messages to Amazon CloudWatch.

```js
const marley = require('marley');
const AwsCloudWatch = require('marley-aws-cloudwatch');

logger.add(new AwsCloudWatch(options));
```

Options:

* __logGroupName:__ The name of the CloudWatch log group to which to log. *[required]*
* __logStreamName:__ The name of the CloudWatch log stream to which to log. *[required]*
* __awsConfig:__ An object containing your `accessKeyId`, `secretAccessKey`, `region`, etc.

Alternatively, you may be interested in [marley-cloudwatch][26].

### Amazon DynamoDB Transport
The [marley-dynamodb][36] transport uses Amazon's DynamoDB as a sink for log messages. You can take advantage of the various authentication methods supports by Amazon's aws-sdk module. See [Configuring the SDK in Node.js](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

``` js
const marley = require('marley');
const { DynamoDB } = require('marley-dynamodb');

logger.add(new DynamoDB(options));
```

Options:
* __accessKeyId:__ your AWS access key id
* __secretAccessKey:__ your AWS secret access key
* __region:__ the region where the domain is hosted
* __useEnvironment:__ use process.env values for AWS access, secret, & region.
* __tableName:__ DynamoDB table name

To Configure using environment authentication:
``` js
logger.add(new marley.transports.DynamoDB({
  useEnvironment: true,
  tableName: 'log'
}));
```

Also supports callbacks for completion when the DynamoDB putItem has been completed.

### Amazon Kinesis Firehose Transport

The [marley-firehose][28] transport relays your log messages to Amazon Kinesis Firehose.

```js
const marley = require('marley');
const WFirehose = require('marley-firehose');

logger.add(new WFirehose(options));
```

Options:

* __streamName:__ The name of the Amazon Kinesis Firehose stream to which to log. *[required]*
* __firehoseOptions:__ The AWS Kinesis firehose options to pass direction to the firehose client, [as documented by AWS](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Firehose.html#constructor-property). *[required]*

### Amazon SNS (Simple Notification System) Transport

The [marley-sns][18] transport uses amazon SNS to send emails, texts, or a bunch of other notifications. Since this transport uses the Amazon AWS SDK for JavaScript, you can take advantage of the various methods of authentication found in Amazon's [Configuring the SDK in Node.js](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html) document.

``` js
const marley = require('marley');
const SnsTransport = require('marley-sns');

logger.add(new SnsTransport(options));
```

Options:

* __subscriber:__ Subscriber number - found in your SNS AWS Console, after clicking on a topic. Same as AWS Account ID. *[required]*
* __topic_arn:__ Also found in SNS AWS Console - listed under a topic as Topic ARN. *[required]*
* __aws_key:__ Your Amazon Web Services Key.
* __aws_secret:__ Your Amazon Web Services Secret.
* __region:__ AWS Region to use. Can be one of: `us-east-1`,`us-west-1`,`eu-west-1`,`ap-southeast-1`,`ap-northeast-1`,`us-gov-west-1`,`sa-east-1`. (default: `us-east-1`)
* __subject:__ Subject for notifications. Uses placeholders for level (%l), error message (%e), and metadata (%m). (default: "Marley Error Report")
* __message:__ Message of notifications. Uses placeholders for level (%l), error message (%e), and metadata (%m). (default: "Level '%l' Error:\n%e\n\nMetadata:\n%m")
* __level:__ lowest level this transport will log. (default: `info`)
* __json:__ use json instead of a prettier (human friendly) string for meta information in the notification. (default: `false`)
* __handleExceptions:__ set to true to have this transport handle exceptions. (default: `false`)

### Azure Table

[marley-azuretable][21] is a Azure Table transport:

``` js
const { AzureLogger } = require('marley-azuretable');
logger.add(new AzureLogger(options));
```

The Azure Table transport connects to an Azure Storage Account using the following options:

* __useDevStorage__: Boolean flag denoting whether to use the Azure Storage Emulator (default: `false`)
* __account__: Azure Storage Account Name. In lieu of this setting, you can set the environment variable: `AZURE_STORAGE_ACCOUNT`
* __key__: Azure Storage Account Key. In lieu of this setting, you can set the environment variable: `AZURE_STORAGE_ACCESS_KEY`
* __level__: lowest logging level transport to be logged (default: `info`)
* __tableName__: name of the table to log messages (default: `log`)
* __partitionKey__: table partition key to use (default: `process.env.NODE_ENV`)
* __silent__: Boolean flag indicating whether to suppress output (default: `false`)

### Cassandra Transport

[marley-cassandra][20] is a Cassandra transport:

``` js
const Cassandra = require('marley-cassandra').Cassandra;
logger.add(new Cassandra(options));
```

The Cassandra transport connects to a cluster using the native protocol with the following options:

* __level:__ Level of messages that this transport should log (default: `'info'`).
* __table:__ The name of the Cassandra column family you want to store log messages in (default: `'logs'`).
* __partitionBy:__ How you want the logs to be partitioned. Possible values `'hour'` and `'day'`(Default).
* __consistency:__ The consistency of the insert query (default: `quorum`).

In addition to the options accepted by the [Node.js Cassandra driver](https://github.com/jorgebay/node-cassandra-cql) Client.

* __hosts:__ Cluster nodes that will handle the write requests:
Array of strings containing the hosts, for example `['host1', 'host2']` (required).
* __keyspace:__ The name of the keyspace that will contain the logs table (required). The keyspace should be already created in the cluster.

### Cisco Spark Transport

[marley-spark][31] is a transport for [Cisco Spark](https://www.ciscospark.com/)

``` js
const marley = require('marley');
require('marley-spark');

const options = {
  accessToken: '***Your Spark Access Token***',
  roomId: '***Spark Room Id***'
};

logger.add(new marley.transports.SparkLogger(options));
```

Valid Options are as the following:
* __accessToken__ Your Spark Access Token. *[required]*
* __roomId__ Spark Room Id. *[required]*
* __level__ Log Level (default: info)
* __hideMeta__ Hide MetaData (default: false)

### Cloudant
[marley-clodant][34] is a transport for Cloudant NoSQL Db.

```js
const marley = require('marley');
const MarleyCloudant = require('marley-cloudant');
logger.add(new MarleyCloudant(options));
```

The Cloudant transport takes the following options:

    url         : Access url including user and password [required]
    username    : Username for the Cloudant DB instance
    password    : Password for the Cloudant DB instance
    host        : Host for the Cloudant DB instance
    db          : Name of the databasename to put logs in
    logstash    : Write logs in logstash format

### Datadog Transport
[datadog-marley][38] is a transport to ship your logs to datadog.

```javascript
var marley = require('marley')
var DatadogMarley = require('datadog-marley')

var logger = marley.createLogger({
  // Whatever options you need
  // Refer https://github.com/marleyjs/marley#creating-your-own-logger
})

logger.add(
  new DatadogMarley({
    apiKey: 'super_secret_datadog_api_key',
    hostname: 'my_machine',
    service: 'super_service',
    ddsource: 'nodejs',
    ddtags: 'foo:bar,boo:baz'
  })
)
```

Options:
* __apiKey__: Your datadog api key *[required]*
* __hostname__: The machine/server hostname
* __service__: The name of the application or service generating the logs
* __ddsource__: The technology from which the logs originated
* __ddtags__: Metadata associated with the logs

### Google BigQuery
[marley-bigquery][42] is a transport for Google BigQuery.

```js
import {MarleyBigQuery} from 'marley-bigquery';
import marley, {format} from 'marley';

const logger = marley.createLogger({
	transports: [
		new MarleyBigQuery({
			tableId: 'marley_logs',
			datasetId: 'logs'
		})
	]
});
```

The Google BigQuery takes the following options:

* __datasetId__   	      	    : Your dataset name [required]
* __tableId__     	  	    : Table name in the datase [required]
* __applicationCredentials__    : a path to local service worker (useful in dev env) [Optional]

**Pay Attention**, since BQ, unlike some other products, is not a "schema-less" you will need to build the schema in advance.
read more on the topic on [github][42] or [npmjs.com][43]

### Google Stackdriver Transport

[@google-cloud/logging-marley][29] provides a transport to relay your log messages to [Stackdriver Logging][30].

```js
const marley = require('marley');
const Stackdriver = require('@google-cloud/logging-marley');
logger.add(new Stackdriver({
  projectId: 'your-project-id',
  keyFilename: '/path/to/keyfile.json'
}));
```

### Graylog2 Transport

[marley-graylog2][19] is a Graylog2 transport:

``` js
const marley = require('marley');
const Graylog2 = require('marley-graylog2');
logger.add(new Graylog2(options));
```

The Graylog2 transport connects to a Graylog2 server over UDP using the following options:

* __name__:  Transport name
* __level__: Level of messages this transport should log. (default: info)
* __silent__: Boolean flag indicating whether to suppress output. (default: false)
* __handleExceptions__: Boolean flag, whenever to handle uncaught exceptions. (default: false)
* __graylog__:
  - __servers__; list of graylog2 servers
    * __host__: your server address (default: localhost)
    * __port__: your server port (default: 12201)
  - __hostname__: the name of this host (default: os.hostname())
  - __facility__: the facility for these log messages (default: "Node.js")
  - __bufferSize__: max UDP packet size, should never exceed the MTU of your system (default: 1400)

### Elasticsearch Transport

Log to Elasticsearch in a logstash-like format and
leverage Kibana to browse your logs.

See: https://github.com/vanthome/marley-elasticsearch.

### FastFileRotate Transport

[fast-file-rotate][35] is a performant file transport providing daily log rotation.

```js
const FileRotateTransport = require('fast-file-rotate');
const marley = require('marley');

const logger = marley.createLogger({
  transports: [
    new FileRotateTransport({
      fileName: __dirname + '/console%DATE%.log'
    })
  ]
})
```

### Humio Transport

[humio-marley][44] is a transport for sending logs to Humio:

``` js
const marley = require('marley');
const HumioTransport = require('humio-marley');

const logger = marley.createLogger({
  transports: [
    new HumioTransport({
      ingestToken: '<YOUR HUMIO INGEST TOKEN>',
    }),
  ],
});
```

### LogDNA Transport

[LogDNA Marley][37] is a transport for being able to forward the logs to [LogDNA](https://logdna.com/):

``` js
const logdnaMarley = require('logdna-marley');
const marley = require('marley');
const logger = marley.createLogger({});
const options = {
    key: apikey, // the only field required
    hostname: myHostname,
    ip: ipAddress,
    mac: macAddress,
    app: appName,
    env: envName,
    index_meta: true // Defaults to false, when true ensures meta object will be searchable
};

// Only add this line in order to track exceptions
options.handleExceptions = true;

logger.add(new logdnaMarley(options));

let meta = {
    data:'Some information'
};
logger.log('info', 'Log from LogDNA Marley', meta);
```

### Logzio Transport

You can download the logzio transport here : [https://github.com/logzio/marley-logzio](https://github.com/logzio/marley-logzio)

*Basic Usage*
```js
const marley = require('marley');
const Logzio = require('marley-logzio');

logger.add(new Logzio({
  token: '__YOUR_API_TOKEN__'
}));
```

For more information about how to configure the logzio transport, view the README.md in the [marley-logzio repo](https://github.com/logzio/marley-logzio).

### Logsene Transport

[marley-logsene][24] transport for Elasticsearch bulk indexing via HTTPS to Logsene:

``` js
const marley = require('marley');
const Logsene = require('marley-logsene');

logger.add(new Logsene({
  token: process.env.LOGSENE_TOKEN
  /* other options */
}));
```
Options:
* __token__: Logsene Application Token
* __source__: Source of the logs (defaults to main module)

[Logsene](http://www.sematext.com/logsene/) features:
- Fulltext search
- Anomaly detection and alerts
- Kibana4 integration
- Integration with [SPM Performance Monitoring for Node.js](http://www.sematext.com/spm/integrations/nodejs-monitoring.html)

### Mail Transport

The [marley-mail][16] is an email transport:

``` js
const { Mail } = require('marley-mail');
logger.add(new Mail(options));
```

The Mail transport uses [node-mail][17] behind the scenes.  Options are the following, `to` and `host` are required:

* __to:__ The address(es) you want to send to. *[required]*
* __from:__ The address you want to send from. (default: `marley@[server-host-name]`)
* __host:__ SMTP server hostname
* __port:__ SMTP port (default: 587 or 25)
* __secure:__ Use secure
* __username__ User for server auth
* __password__ Password for server auth
* __level:__ Level of messages that this transport should log.
* __silent:__ Boolean flag indicating whether to suppress output.

*Metadata:* Stringified as JSON in email.

### MySQL Transport

[marley-mysql](https://github.com/charles-zh/marley-mysql) is a MySQL transport for Marley.

Create a table in your database first:

```sql
 CREATE TABLE `sys_logs_default` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `level` VARCHAR(16) NOT NULL,
 `message` VARCHAR(2048) NOT NULL,
 `meta` VARCHAR(2048) NOT NULL,
 `timestamp` DATETIME NOT NULL,
 PRIMARY KEY (`id`)); 
```

> You can also specify `meta` to be a `JSON` field on MySQL 5.7+, i.e., ``meta` JSON NOT NULL`, which is helfpul for searching and parsing.

Configure Marley with the transport:

```javascript
import MySQLTransport from 'marley-mysql';

const options = {
    host: '${MYSQL_HOST}',
    user: '${MYSQL_USER}',
    password: '${MYSQL_PASSWORD}',
    database: '${MYSQL_DATABASE}',
    table: 'sys_logs_default'
};

const logger = marley.createLogger({
    level: 'debug',
    format: marley.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new marley.transports.Console({
            format: marley.format.simple(),
        }),
        new MySQLTransport(options),
    ],
});

/// ...
let msg = 'My Log';
logger.info(msg, {message: msg, type: 'demo'});
```


### New Relic Agent Transport

[marley-newrelic-agent-transport][47] is a New Relic transport that leverages the New Relic agent:

``` js
import marley from 'marley'
import NewrelicTransport from 'marley-newrelic-agent-transport'

const logger = marley.createLogger()

const options = {}
logger.add(new NewrelicTransport(options))
```

The New Relic agent typically automatically forwards Marley logs to New Relic when using CommonJS. With CommonJS no additional transport should be needed. However, when using ECMAScript modules, the automatic forwarding of logs can with certain coding patterns not work. If the New Relic agent is not automatically forwarding your logs, this transport provides a solution.

Options:

* __level__ (optional): The Marley logging level to use as the maximum level of messages that the transport will log.
* __rejectCriteria__ (optional): The rejectCriteria option allows you to specify an array of regexes that will be matched against either the Marley info object or log message to determine whether or not a log message should be rejected and not logged to New Relic.

### Papertrail Transport

[marley-papertrail][27] is a Papertrail transport:

``` js
const { Papertrail } = require('marley-papertrail');
logger.add(new Papertrail(options));
```

The Papertrail transport connects to a [PapertrailApp log destination](https://papertrailapp.com) over TCP (TLS) using the following options:

* __level:__ Level of messages this transport should log. (default: info)
* __host:__ FQDN or IP address of the Papertrail endpoint.
* __port:__ Port for the Papertrail log destination.
* __hostname:__ The hostname associated with messages. (default: require('os').hostname())
* __program:__ The facility to send log messages.. (default: default)
* __logFormat:__ a log formatting function with the signature `function(level, message)`, which allows custom formatting of the level or message prior to delivery

*Metadata:* Logged as a native JSON object to the 'meta' attribute of the item.

### Parseable Transport

[Parseable](https://parseable.com/) is an open source, general purpose log analytics system. [Parseable-Marley](https://github.com/jybleau/parseable-node-loggers/tree/main/packages/marley#parseable-marley) is a Parseable transport for Marley.  

```js
// Using cjs
const { ParseableTransport } = require('parseable-marley')
const marley = require('marley')

const parseable = new ParseableTransport({
  url: process.env.PARSEABLE_LOGS_URL, // Ex: 'https://parsable.myserver.local/api/v1/logstream'
  username: process.env.PARSEABLE_LOGS_USERNAME,
  password: process.env.PARSEABLE_LOGS_PASSWORD,
  logstream: process.env.PARSEABLE_LOGS_LOGSTREAM, // The logstream name
  tags: { tag1: 'tagValue' } // optional tags to be added with each ingestion
})

const logger = marley.createLogger({
  levels: marley.config.syslog.levels,
  transports: [parseable],
  defaultMeta: { instance: 'app', hostname: 'app1' }
})

logger.info('User took the goggles', { userid: 1, user: { name: 'Rainier Wolfcastle' } })
logger.warning('The goggles do nothing', { userid: 1 })
```

### PostgresQL Transport

[@pauleliet/marley-pg-native](https://github.com/petpano/marley-pg-native) is a PostgresQL transport supporting Marley 3.X.

### Pusher Transport
[marley-pusher](https://github.com/meletisf/marley-pusher) is a Pusher transport.

```js
const { PusherLogger } = require('marley-pusher');
logger.add(new PusherLogger(options));
```

This transport sends the logs to a Pusher app for real time processing and it uses the following options:

* __pusher__ [Object]
  * __appId__ The application id obtained from the dashboard
  * __key__ The application key obtained from the dashboard
  * __secret__ The application secret obtained from the dashboard
  * __cluster__ The cluster
  * __encrypted__ Whether the data will be send through SSL
* __channel__ The channel of the event (default: default)
* __event__ The event name (default: default)

### Sentry Transport
[marley-transport-sentry-node][41] is a transport for [Sentry](https://sentry.io/) uses [@sentry/node](https://www.npmjs.com/package/@sentry/node).

```js
const Sentry = require('marley-transport-sentry-node').default;
logger.add(new Sentry({
  sentry: {
    dsn: 'https://******@sentry.io/12345',
  },
  level: 'info'
}));
```

This transport takes the following options:

* __sentry:__ [Object]
  * __dsn:__ Sentry DSN or Data Source Name (default: `process.env.SENTRY_DSN`) **REQUIRED**
  * __environment:__ The application environment (default: `process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production'`)
  * __serverName:__  The application name
  * __debug:__ Turns debug mode on or off (default: `process.env.SENTRY_DEBUG || false`)
  * __sampleRate:__ Sample rate as a percentage of events to be sent in the range of 0.0 to 1.0 (default: `1.0`)
  * __maxBreadcrumbs:__ Total amount of breadcrumbs that should be captured (default: `100`)
* __level:__ Level of messages that this transport should log
* __silent:__  Boolean flag indicating whether to suppress output, defaults to false

### Seq Transport

[marley-seq][45] is a transport that sends structured log events to [Seq](https://datalust.co/seq).

```js
const { SeqTransport } = require('@datalust/marley-seq');
logger.add(new SeqTransport({
  serverUrl: "https://your-seq-server:5341",
  apiKey: "your-api-key",
  onError: (e => { console.error(e) }),
}));
```

`SeqTransport` is configured with the following options:

* __serverUrl__ - the URL for your Seq server's ingestion
* __apiKey__ - (optional) The Seq API Key to use
* __onError__ - Callback to execute when an error occurs within the transport

### SimpleDB Transport

The [marley-simpledb][15] transport is just as easy:

``` js
const SimpleDB = require('marley-simpledb').SimpleDB;
logger.add(new SimpleDB(options));
```

The SimpleDB transport takes the following options. All items marked with an asterisk are required:

* __awsAccessKey__:* your AWS Access Key
* __secretAccessKey__:* your AWS Secret Access Key
* __awsAccountId__:* your AWS Account Id
* __domainName__:* a string or function that returns the domain name to log to
* __region__:* the region your domain resides in
* __itemName__: a string ('uuid', 'epoch', 'timestamp') or function that returns the item name to log

*Metadata:* Logged as a native JSON object to the 'meta' attribute of the item.

### Slack Transport
[marley-slack-webhook-transport][39] is a transport that sends all log messages to the Slack chat service.

```js
const marley = require('marley');
const SlackHook = require('marley-slack-webhook-transport');

const logger = marley.createLogger({
	level: 'info',
	transports: [
		new SlackHook({
			webhookUrl: 'https://hooks.slack.com/services/xxx/xxx/xxx'
		})
	]
});

logger.info('This should now appear on Slack');
```

This transport takes the following options:

* __webhookUrl__ - Slack incoming webhook URL. This can be from a basic integration or a bot. **REQUIRED**
* __channel__ - Slack channel to post message to.
* __username__ - Username to post message with.
* __iconEmoji__ - Status icon to post message with. (interchangeable with __iconUrl__)
* __iconUrl__ - Status icon to post message with. (interchangeable with __iconEmoji__)
* __formatter__ - Custom function to format messages with. This function accepts the __info__ object ([see Marley documentation](https://github.com/marleyjs/marley/blob/master/README.md#streams-objectmode-and-info-objects)) and must return an object with at least one of the following three keys: __text__ (string), __attachments__ (array of [attachment objects](https://api.slack.com/docs/message-attachments)), __blocks__ (array of [layout block objects](https://api.slack.com/messaging/composing/layouts)). These will be used to structure the format of the logged Slack message. By default, messages will use the format of `[level]: [message]` with no attachments or layout blocks.
* __level__ - Level to log. Global settings will apply if this is blank.
* __unfurlLinks__ - Enables or disables [link unfurling.](https://api.slack.com/docs/message-attachments#unfurling) (Default: false)
* __unfurlMedia__ - Enables or disables [media unfurling.](https://api.slack.com/docs/message-link-unfurling) (Default: false)
* __mrkdwn__ - Enables or disables [`mrkdwn` formatting](https://api.slack.com/messaging/composing/formatting#basics) within attachments or layout blocks (Default: false)

### SQLite3 Transport

The [marley-better-sqlite3][40] transport uses [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3).

```js
const wbs = require('marley-better-sqlite3');
logger.add(new wbs({

    // path to the sqlite3 database file on the disk
    db: '<name of sqlite3 database file>',

    // A list of params to log
    params: ['level', 'message']
}));
```

### Sumo Logic Transport
[marley-sumologic-transport][32] is a transport for Sumo Logic

``` js
const marley = require('marley');
const { SumoLogic } = require('marley-sumologic-transport');

logger.add(new SumoLogic(options));
```

Options:
* __url__: The Sumo Logic HTTP collector URL

### SSE transport with KOA 2
[marley-koa-sse](https://github.com/alexvictoor/marley-koa-sse) is a transport that leverages on Server Sent Event. With this transport you can use your browser console to view your server logs.

### VS Code extension

[marley-transport-vscode][48] is a transport for VS Code extension development.

```js
const vscode = require('vscode');
const marley = require('marley');
const { OutputChannelTransport } = require('marley-transport-vscode');

const outputChannel = vscode.window.createOutputChannel('My extension');

const logger = marley.createLogger({
  transports: [new OutputChannelTransport({ outputChannel })],
});
```

The extension includes dedicated log levels and format for using with VS Code's
LogOutputChannel.

```js
const { LogOutputChannelTransport } = require('marley-transport-vscode');

const outputChannel = vscode.window.createOutputChannel('My extension', {
  log: true,
});

const logger = marley.createLogger({
  levels: LogOutputChannelTransport.config.levels,
  format: LogOutputChannelTransport.format(),
  transports: [new LogOutputChannelTransport({ outputChannel })],
});
```


### Worker Thread based async Console transport

[marley-console-transport-in-worker][46]

```typescript
import * as marley from 'marley';
import { ConsoleTransportInWorker } from '@rpi1337/marley-console-transport-in-worker';

...

export const logger: marley.Logger = marley.createLogger({
    format: combine(timestamp(), myFormat),
    level: Level.INFO,
    transports: [new ConsoleTransportInWorker()],
});
```

The `ConsoleTransportInWorker` is a subclass of `marley.transports.Console` therefore accepting the same options as the `Console` transport.

TypeScript supported.

### Winlog2 Transport

[marley-winlog2][33] is a Windows Event log transport:

``` js
const marley = require('marley');
const Winlog2 = require('marley-winlog2');
logger.add(new Winlog2(options));
```

The winlog2 transport uses the following options:

* __name__:  Transport name
* __eventLog__: Log type (default: 'APPLICATION')
* __source__: Name of application which will appear in event log (default: 'node')

## Looking for maintainers

These transports are part of the `marley` Github organization but are
actively seeking new maintainers. Interested in getting involved? Open an
issue on `marley` to get the conversation started!

* [CouchDB](#couchdb-transport)
* [Loggly](#loggly-transport)
* [Redis](#redis-transport)
* [Riak](#riak-transport)

### CouchDB Transport

_As of `marley@0.6.0` the CouchDB transport has been broken out into a new module: [marley-couchdb][2]._

``` js
const MarleyCouchDb = require('marley-couchdb');
logger.add(new MarleyCouchdb(options));
```

The `Couchdb` will place your logs in a remote CouchDB database. It will also create a [Design Document][3], `_design/Logs` for later querying and streaming your logs from CouchDB. The transport takes the following options:

* __host:__ (Default: **localhost**) Remote host of the HTTP logging endpoint
* __port:__ (Default: **5984**) Remote port of the HTTP logging endpoint
* __db:__ (Default: **marley**) Remote URI of the HTTP logging endpoint
* __auth:__ (Default: **None**) An object representing the `username` and `password` for HTTP Basic Auth
* __ssl:__ (Default: **false**) Value indicating if we should us HTTPS

### Loggly Transport

_As of `marley@0.6.0` the Loggly transport has been broken out into a new module: [marley-loggly][5]._

``` js
const MarleyLoggly = require('marley-loggly');
logger.add(new marley.transports.Loggly(options));
```

The Loggly transport is based on [Nodejitsu's][6] [node-loggly][7] implementation of the [Loggly][8] API. If you haven't heard of Loggly before, you should probably read their [value proposition][9]. The Loggly transport takes the following options. Either 'inputToken' or 'inputName' is required:

* __level:__ Level of messages that this transport should log.
* __subdomain:__ The subdomain of your Loggly account. *[required]*
* __auth__: The authentication information for your Loggly account. *[required with inputName]*
* __inputName:__ The name of the input this instance should log to.
* __inputToken:__ The input token of the input this instance should log to.
* __json:__ If true, messages will be sent to Loggly as JSON.

### Redis Transport

``` js
const MarleyRedis = require('marley-redis');
logger.add(new MarleyRedis(options));
```

This transport accepts the options accepted by the [node-redis][4] client:

* __host:__ (Default **localhost**) Remote host of the Redis server
* __port:__ (Default **6379**) Port the Redis server is running on.
* __auth:__ (Default **None**) Password set on the Redis server

In addition to these, the Redis transport also accepts the following options.

* __length:__ (Default **200**) Number of log messages to store.
* __container:__ (Default **marley**) Name of the Redis container you wish your logs to be in.
* __channel:__ (Default **None**) Name of the Redis channel to stream logs from.

### Riak Transport

_As of `marley@0.3.0` the Riak transport has been broken out into a new module: [marley-riak][11]._ Using it is just as easy:

``` js
const { Riak } = require('marley-riak');
logger.add(new Riak(options));
```

In addition to the options accepted by the [riak-js][12] [client][13], the Riak transport also accepts the following options. It is worth noting that the riak-js debug option is set to *false* by default:

* __level:__ Level of messages that this transport should log.
* __bucket:__ The name of the Riak bucket you wish your logs to be in or a function to generate bucket names dynamically.

``` js
  // Use a single bucket for all your logs
  const singleBucketTransport = new Riak({ bucket: 'some-logs-go-here' });

  // Generate a dynamic bucket based on the date and level
  const dynamicBucketTransport = new Riak({
    bucket: function (level, msg, meta, now) {
      var d = new Date(now);
      return level + [d.getDate(), d.getMonth(), d.getFullYear()].join('-');
    }
  });
```


## Find more Transports

There are more than 1000 packages on `npm` when [you search for] `marley`.
That's why we say it's a logger for just about everything

[you search for]: https://www.npmjs.com/search?q=marley
[0]: https://nodejs.org/api/stream.html#stream_class_stream_writable
[1]: https://github.com/flatiron/marleyd
[2]: https://github.com/indexzero/marley-couchdb
[3]: http://guide.couchdb.org/draft/design.html
[4]: https://github.com/mranney/node_redis
[5]: https://github.com/indexzero/marley-loggly
[6]: http://nodejitsu.com
[7]: https://github.com/nodejitsu/node-loggly
[8]: http://loggly.com
[9]: http://www.loggly.com/product/
[10]: http://wiki.loggly.com/loggingfromcode
[11]: https://github.com/indexzero/marley-riak
[12]: http://riakjs.org
[13]: https://github.com/frank06/riak-js/blob/master/src/http_client.coffee#L10
[14]: http://github.com/indexzero/marley-mongodb
[15]: http://github.com/appsattic/marley-simpledb
[16]: http://github.com/wavded/marley-mail
[17]: https://github.com/weaver/node-mail
[18]: https://github.com/jesseditson/marley-sns
[19]: https://github.com/namshi/marley-graylog2
[20]: https://github.com/jorgebay/marley-cassandra
[21]: https://github.com/jpoon/marley-azuretable
[22]: https://github.com/rickcraig/marley-airbrake2
[24]: https://github.com/sematext/marley-logsene
[25]: https://github.com/timdp/marley-aws-cloudwatch
[26]: https://github.com/lazywithclass/marley-cloudwatch
[27]: https://github.com/kenperkins/marley-papertrail
[28]: https://github.com/pkallos/marley-firehose
[29]: https://www.npmjs.com/package/@google-cloud/logging-marley
[30]: https://cloud.google.com/logging/
[31]: https://github.com/joelee/marley-spark
[32]: https://github.com/avens19/marley-sumologic-transport
[33]: https://github.com/peteward44/marley-winlog2
[34]: https://github.com/hakanostrom/marley-cloudant
[35]: https://github.com/SerayaEryn/fast-file-rotate
[36]: https://github.com/inspiredjw/marley-dynamodb
[37]: https://github.com/logdna/logdna-marley
[38]: https://github.com/itsfadnis/datadog-marley
[39]: https://github.com/TheAppleFreak/marley-slack-webhook-transport
[40]: https://github.com/punkish/marley-better-sqlite3
[41]: https://github.com/aandrewww/marley-transport-sentry-node
[42]: https://github.com/kaminskypavel/marley-bigquery
[43]: https://www.npmjs.com/package/marley-bigquery
[44]: https://github.com/Quintinity/humio-marley
[45]: https://github.com/datalust/marley-seq
[46]: https://github.com/arpad1337/marley-console-transport-in-worker
[47]: https://github.com/kimnetics/marley-newrelic-agent-transport
[48]: https://github.com/loderunner/marley-transport-vscode
