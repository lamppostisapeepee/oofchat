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
    
});
app.use(express.static("static"));