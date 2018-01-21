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
    let content = msg.content.split("@"+nickname).join(`<strong class="msgMention">@${nickname}</strong>`);
    if (msg.author == nickname) content = msg.content;
    $(".messages").append(`<p class="message message${msgStyle?"A":"B"}">${date} <strong>${msg.author} </strong>${content}</p>`);
    msgStyle = !msgStyle;
    $('.messages').animate({
        scrollTop: $('.messages').get(0).scrollHeight
    }, 500);
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

$("#nickForm").submit(e => {
    e.preventDefault();
    const nick = $("#nickContent").val();
    setNickname(nick);
    $('.nickname-choose').animate({'margin-top': `-${window.outerWidth+10}px`}, 300);
    $(".nicknameDisplay").val(`Logged in as ${nickname}`);
});

});
