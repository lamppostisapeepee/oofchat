var socket = io();
/**
 * @type {String}
 */
var nickname;
/**
 * Set self nickname, can only be used once per session.
 * @param {String} nick 
 */
function setNickname(nick) {
    if (nickname) throw new Error("Nickname can only be set once!");
    socket.emit("nickname", nick);
    nickname = nick
}
socket.on('disconnect reason', reason => {
    socket.on('disconnect', () => {
        document.write("Disconnected, reason: "+reason);
    });
});


$.ready(() => {

// Message sending
$("#msgForm").submit(e => {
    return false;
});

});
