'use strict';

var TelegramBot = require('node-telegram-bot-api');
var PranzioClient = require('./pranzio');
var MESSAGES = require('./messages');

// helper function -> exit with error
var exit = function (msg) {
    console.error(msg);
    throw new Error(msg);
};

module.exports = function (token, options) {
    options = options || {};

    // check variables
    if (!token) {
        exit('Please add a TOKEN env variable with the TelegramBot token');
    }

    // check if the bot should use a webHook
    var webHook = options.webHook;

    var pranzio = new PranzioClient(options.redisUrl);

    // set bot mode (polling vs webHook) depending on the environment
    var botOptions = {};
    if (webHook) {
        botOptions.webHook = {
            port: options.port || 5000,
            host: '0.0.0.0'
        };
    } else {
        botOptions.polling = true;
    }

    // create Bot
    var bot = new TelegramBot(token, botOptions);
    if (webHook) {
        bot.setWebHook(webHook + ':443/bot' + token);
    }

    // get bot name
    bot.getMe().then(function (me) {

        // save bot name
        var myName = '@' + me.username;

        // reply to text messages
        bot.on('text', function (msg) {
            
            //trim the message and tokenize it
            var args = msg.text.trim().split(" ");

            // parse command (eg. /start@PranzioBot => /start)
            var command = args[0].replace(myName, '');

            //remove the command from the arguments list
            args.shift();

            // get chat id
            var chatID = msg.chat.id;

            //get user id
            var userID = msg.from.id;

            //get the user username
            var username = msg.from.username;

            //handle the case where the user has no username set
            if(username == '' || username == undefined)
                username = msg.from.first_name;

            // reply
            switch (command) {

                // show the welcome message
                case '/start':
                    //I need to save the chatID and not the userID, since I will
                    //need the chatID to send them the pranzio-signal
                    pranzio.activate(chatID);
                    bot.sendMessage(chatID, MESSAGES.WELCOME);
                    break;

                    // print the help message
                case '/help':
                    bot.sendMessage(chatID, MESSAGES.HELP);
                    break;

                    //activate notifications
                case '/on':
                    pranzio.activate(chatID);
                    bot.sendMessage(chatID, MESSAGES.SET_ON);
                    break;

                    //deactivate notifications
                case '/off':
                    pranzio.deactivate(chatID);
                    bot.sendMessage(chatID, MESSAGES.SET_OFF);
                    break;

                    //send the pranzio-signal
                case '/pranzio':
                    pranzio.callPranzio(username,args[0],bot);
                    bot.sendMessage(chatID,MESSAGES.PRANZIO_CALLED);
                    break;
/*
 * future release
                case '/status':
                    //TODO;
                    break;

                case '/setgroup':
                    if(args[0]=='undefined')
                        bot.sendMessage(chatID, MESSAGES.MISSING_ARGS);
                    else
                    {
                        //TODO: DB call
                    }
                    break;
*/
                default:
                    if (new RegExp('^\/([^@])*((' + me.username + ')\s*.*)?$').test(command)) {
                        bot.sendMessage(chatID, MESSAGES.UNKNOWN_COMMAND);
                    }
            }
        });
    }
});

// debug message
console.info('# running... Press Ctrl+C to exit'.replace('#', myName));

    }).catch(function () {
        /* istanbul ignore next */
        exit('Error starting the Bot... maybe the TOKEN is wrong?');
    });

    return bot;
};
