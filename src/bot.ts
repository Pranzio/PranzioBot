/// <reference path="../typings/tsd.d.ts" />
import TelegramBot = require('node-telegram-bot-api');
import MESSAGES from './messages';
import PranzioLogger from './logger';
import DB from './db';

// helper function -> exit with error
function exit(msg) {
    console.error(msg);
    throw new Error(msg);
}

// check if it is pranzio time
function isPranzioTime() {
    // TODO: check for timezone and daylight saving time
    let hour = new Date().getHours();
    return hour > 11 && hour < 14;
}

// entry point
async function main() {

    // read environment variables
    const TOKEN = process.env.TOKEN;
    const PORT = process.env.PORT;
    const WEBHOOK = process.env.WEBHOOK;

    // check parameters
    if (!TOKEN) {
        exit('Please add a TOKEN env variable with the TelegramBot token');
    }
    if (!WEBHOOK) {
        exit('Please add a WEBHOOK...');
    }

    // create logger
    let logger = new PranzioLogger();

    // open db
    let db = new DB();

    // create Bot
    let bot = new TelegramBot(TOKEN, {
        webHook: {
            port: PORT || 8000,
            host: '0.0.0.0'
        }
    });
    bot.setWebHook(WEBHOOK + '/bot' + TOKEN);

    // get bot name
    let me = await bot.getMe();
    let name = '@' + me.username;

    // reply to text messages
    bot.on('text', async function (msg) {

        // TODO: build regex to remove @PranzioBot at the end of the commands
        // parse command (eg. /start@PranzioBot => /start)
        let args = msg.text.trim().split(' ');
        let command = args[0].replace(name, '');
        args.shift();

        // get info from the message
        let chatID = msg.chat.id;
        let userID = msg.from.id;
        let username = msg.from.username;

        // handle the case where the user has no username set
        if (typeof username === 'undefined' || username === '') {
            username = msg.from.first_name;
        }

        // reply
        switch (command) {

            // show the welcome message
            case '/start':
                // I need to save the chatID and not the userID, since I will
                // need the chatID to send them the pranzio-signal
                db.addUser(chatID);
                bot.sendMessage(chatID, MESSAGES.WELCOME);
                break;

            // print the help message
            case '/help':
                bot.sendMessage(chatID, MESSAGES.HELP);
                break;

            // activate notifications
            case '/on':
                db.addUser(chatID);
                bot.sendMessage(chatID, MESSAGES.SET_ON);
                break;

            // deactivate notifications
            case '/off':
                db.removeUser(chatID);
                bot.sendMessage(chatID, MESSAGES.SET_OFF);
                break;

            // send the pranzio-signal
            case '/pranzio':

                // log
                logger.log(userID, username);

                // check if pranzio time
                let pranzioTime = isPranzioTime();

                // pranzio time -> send message
                if (pranzioTime) {
                    let subscribers = await db.getUsers();
                    subscribers.forEach(user => {
                        let msg = username + MESSAGES.PRANZIO_MSG + args[0];
                        bot.sendMessage(user, msg);
                    });
                    bot.sendMessage(chatID, MESSAGES.PRANZIO_CALLED);
                }

                // no pranzio time =(
                else {
                    bot.sendMessage(chatID, MESSAGES.PRANZIO_CLOSED);
                }

                break;

            default:
                if (new RegExp('^\/([^@])*((' + name + ')\s*.*)?$').test(command)) {
                    bot.sendMessage(chatID, MESSAGES.ERR_UNKNOW_COMMAND);
                }
        }
    });

    // running =D
    console.info(`${name} running... Press Ctrl+C to stop the bot.`);
}

// execute bot
main();
