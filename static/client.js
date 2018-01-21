var socket = io();
/**
 * @type {String}
 */
var nickname;
var msgStyle = false;
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
function makeChatNotific(msg) {
    new Notification(`${msg.author} oofed you!`, {body: msg.contentNoMarkdown, icon: "oof.png"});
}

socket.on('chat message', msg => {
    const date = moment().format("(hh:mm:ss)");
    $(".messages").append(`<p class="message message${msgStyle?"A":"B"}">${date} <strong>${msg.author} </strong>${msg.content.split("@"+nickname).join(`<strong class="msgMention">@${nickname}</strong>`)}</p>`);
    msgStyle = !msgStyle;
    if (msg.content.includes("@"+nickname) && msg.author != nickname) {
        if (!("Notification" in window)) return; // browser does not support notific
        if (Notification.permission == "granted") {
            makeChatNotific(msg);
        } else if (Notification.permission != "denied") {
            Notification.requestPermission(permission => {
                if (permission == "granted") {
                    makeChatNotific(msg);
                }
            });
        }
    }
});

$(document).ready(() => {

// Message sending
$("#msgForm").submit(e => {
    e.preventDefault();
    const content = $("#msgContent").val();
    if (content.split(" ").join("") == "") return;
    socket.emit("chat message", content);
    $("#msgContent").val("");
});

});
