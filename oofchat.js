const express = require("express");
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
    setInterval(() => {
        if (socket.nickname) return;
        socket.emit("disconnect reason", "idle no nickname");
        socket.disconnect(true); // He was idle for more then 5 min without choosing a nickname! 
    },5 * 60 * 1000);
    socket.on('nickname', nickname => {
        if (typeof nickname != "string") {
            socket.emit("disconnect reason", "bad nickname");
            socket.disconnect(true);
        }
        socket.nickName = nickname;

        socket.on('chat message', msg => {
            if (typeof msg != "string") {
                socket.emit("disconnect reason", "bad message");
                socket.disconnect(true);
            }
            io.emit("chat message", {author: socket.nickname, content: msg});
        });
    });
});
app.use(express.static("static"));