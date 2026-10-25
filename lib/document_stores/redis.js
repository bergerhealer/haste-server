var redis = require('redis');
var winston = require('winston');

// For storing in redis
// options[type] = redis
// options[host] - The host to connect to (default localhost)
// options[port] - The port to connect to (default 5379)
// options[db] - The db to use (default 0)
// options[expire] - The time to live for each key set (default never)

var RedisDocumentStore = function(options, client) {
  this.expire = options.expire;
  if (client) {
    winston.info('using predefined redis client');
    RedisDocumentStore.client = client;
  } else if (!RedisDocumentStore.client) {
    winston.info('configuring redis');
    RedisDocumentStore.connect(options);
  }
};

RedisDocumentStore.isReady = function() {
  return RedisDocumentStore.client && RedisDocumentStore.client.isReady;
};

// Create a connection according to config
RedisDocumentStore.connect = function(options) {
  var host = options.host || '127.0.0.1';
  var port = options.port || 6379;
  var index = options.db || 0;
  var redisUrl = options.url || ('redis://' + host + ':' + port);

  RedisDocumentStore.client = redis.createClient({
    url: redisUrl,
    database: index,
    password: options.password,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: 5000
    }
  });

  RedisDocumentStore.client.on('error', function(err) {
    winston.error('redis disconnected', err);
  });

  RedisDocumentStore.client.connect().then(function() {
    winston.info('connected to redis on ' + host + ':' + port + '/' + index);
  }).catch(function(err) {
    winston.error(
      'error connecting to redis index ' + index,
      { error: err }
    );
    process.exit(1);
  });
};

// Save file in a key
RedisDocumentStore.prototype.set = function(key, data, callback, skipExpire) {
  if (!RedisDocumentStore.isReady()) {
    callback(false);
    return;
  }
  var _this = this;
  RedisDocumentStore.client.set(key, data).then(function() {
      if (!skipExpire) {
        _this.setExpiration(key);
      }
      callback(true);
  }).catch(function() {
    callback(false);
  });
};

// Expire a key in expire time if set
RedisDocumentStore.prototype.setExpiration = function(key) {
  if (this.expire && RedisDocumentStore.isReady()) {
    RedisDocumentStore.client.expire(key, this.expire).catch(function() {
      winston.error('failed to set expiry on key: ' + key);
    });
  }
};

// Get a file from a key
RedisDocumentStore.prototype.get = function(key, callback, skipExpire) {
  if (!RedisDocumentStore.isReady()) {
    callback(false);
    return;
  }
  var _this = this;
  RedisDocumentStore.client.get(key).then(function(reply) {
    if (!skipExpire) {
      _this.setExpiration(key);
    }
    callback(reply || false);
  }).catch(function() {
    callback(false);
  });
};

module.exports = RedisDocumentStore;
