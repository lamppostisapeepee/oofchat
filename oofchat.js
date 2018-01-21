const express = require("express");
const marked = require("marked");
const escape = require('escape-html');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 3004;
/**
 * @typedef {Object} Message
 * @property {String} content Message content
 */

http.listen(port, () => {
    console.log("Listening on port " + port);
});
io.on('connection', async socket => {
    console.log("a user connected from somewhere in the universe.");
    socket.ratelimits = {message: 0};
    socket.ratelimitInterval = setInterval(() => {
        for (let ratelimit in socket.ratelimits) {
            if (socket.ratelimits[ratelimit] > 0) socket.ratelimits[ratelimit]--;
        }
    }, 1);
    socket.nickInterval = setInterval(() => {
        if (socket.nickname) return;
        socket.emit("disconnect reason", "idle no nickname");
        socket.disconnect(true); // He was idle for more then 5 min without choosing a nickname! 
    },5 * 60 * 1000);
    socket.on('disconnect', () => {
        if (socket.nickname) return;
        clearInterval(socket.nickInterval);
    });
    socket.on('nickname', nickname => {
        if (typeof nickname != "string") {
            socket.emit("disconnect reason", "bad nickname");
            socket.disconnect(true);
        }
        socket.nickname = nickname;

        socket.on('chat message', msg => {
            if (socket.ratelimits.message != 0) {
                socket.emit("disconnect reason", "ratelimited[messages]");
                socket.disconnect(true);
            }
            if (typeof msg != "string") {
                socket.emit("disconnect reason", "bad message");
                socket.disconnect(true);
            }
            if (msg.length > 200) {
                socket.emit("disconnect reason", "message too big");
                socket.disconnect(true);
            }
            socket.ratelimits.message = 1000 * 0.3; // can send message every 0.3 seconds
            /**
             * @type {String}
             */
            let content = marked(escape(msg));
            content = content.slice(3, content.length-4);
            io.emit("chat message", {author: socket.nickname, content});
        });
    });
});
app.use(express.static("static"));