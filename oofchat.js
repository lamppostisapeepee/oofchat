const express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 3004;
http.listen(port, () => {
    console.log("Listening on port " + port);
});
io.on('connection', async socket => {
    console.log("a user connected from somewhere in the universe.");
    setInterval(() => {
        if (socket.nickname) return;
        socket.disconnect(true); // He was idle for more then 5 min without choosing a nickname! 
        console.log("Kicked a user for idleing before choosing a nickname");
    },5 * 60 * 1000);
    socket.on('nickname', nickname => {
        if (typeof nickname != "string") socket.disconnect(true); // huehue
        socket.nickName = nickname;
    });
});
app.use(express.static("static"));