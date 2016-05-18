'use strict';

var redis = require('redis');

var RedisClient = function(url)
{
    this.client = redis.createClient(url);
};

RedisClient.prototype.insertUser = function(id)
{
    return this.client.sadd("userids",id);
};

RedisClient.prototype.deleteUser = function(id)
{
    return this.client.srem("userids",id);
};

RedisClient.prototype.getAll = function()
{
    return this.client.smembers();
};

module.exports = RedisClient;
