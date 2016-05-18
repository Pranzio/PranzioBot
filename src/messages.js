'use strict';

var MESSAGES = Object.freeze({
    
   /* questa e' la descrizione cavoli
    WELCOME: 'Sei stufo di essere considerato uno spammer solo perché ogni ' +
             'giorno chiedi ai tuoi amici a che ora pranzare?\n Sei stanco ' +
             'di perderti milioni di messaggi importanti */
    WELCOME: "Benvenuto! PranzioBot ti aiuta ad organizzarti meglio con i tuoi"   +
             " amici per pranz(i)are assieme!\n\n Con /on e /off puoi attivare o "+
             "disattivare gli avvisi mentre semplicemente con /pranzio avvisi "   +
             "tutti quanti che è ora di pranz(i)are assieme!\n\n Mai più "        +
             "chat intasate da messaggi inutili :) ",

    HELP:    "/start           Avvia il bot e attiva la ricezione dei messaggi"+
             "/help            Mostra l'elenco di (quasi) tutti i comandi\n"   +
             "/on              Attiva le notifiche per il pranzio\n"           +
             "/off             Disattiva le notifiche per il pranzio\n"        +
             "/pranzio  <msg>  Invia il Pranzio-segnale assieme ad un  messaggio personale scritto subito dopo il comando\n",

    ERR_CLOSED: "La mensa è chiusa adesso!\n",
    ERR_WEEKEND:"La mensa è chiusa nel weekend!\n",
    UNKNOW_COMMAND: "Il comando non è ancora stato implementato, ma lo sarà a"+
                "breve. Forse. Forse mai.\n",
    MISSING_ARGS: "Questo comando richiede almeno un parametro. Leggi la " +
                  "descrizione con /help, dai :(\n",
    SET_ON:  "Hai attivato la ricezione dei messaggi, buon pranzio\n", 
    SET_OFF: "Hai disattivato la ricezione dei messaggi, asociale.\n",
    PRANZIO_MSG: " chiama il Pranzio con il seguente messaggio:\n\n\n", //username+PRANZIO_MSG+message, see line 26 of pranzio.js
    PRANZIO_CALLED: "Hai scelto di chiamare a raccolta i tuoi discepoli per il Pranzio\n Buon appetito!",
    PRANZIO_CLOSED: "La mensa è chiusa :("
});

module.exports = MESSAGES;
