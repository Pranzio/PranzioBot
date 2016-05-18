'use strict';

var RedisClient = require('./db');
var MESSAGES = require('./messages');

var Pranzio = function(dbUrl)
{
    this.redis = new RedisClient(dbUrl);
};

Pranzio.prototype.activate = function(userid)
{
    redis.insertUser(userid);
};

Pranzio.prototype.deactivate = function(userid)
{
    redis.deleteUser(userid);
};

Pranzio.prototype.callPranzio = function(username,message,bot)
{
    //TODO: check for timezone and daylight saving time
    var date = new Date();
    date = date.getHours();
    if(!(!(date < 11) && !(date > 14)))
        return false;
    else
    {
        var subscribers = redis.getAll();
        var msg = username+MESSAGES.PRANZIO_MSG+message;
        for(var i=0; i<subscribers.length;i++)
            bot.sendMessage(subscribers[i],msg);
        return true;
    }
};
