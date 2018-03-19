var socket = io();
/**
 * @type {String}
 */
var nickname;
var msgStyle = false;
var typingms = 0;
var ratelimits = {message: 0};
// This determines special name colours.
var colourConfig = {
    "lucas": "#33ccff",
    "toro": "gold",
    "jellyboi": "#28cc72",
    "ron": "#f44b42",
    "aura": "#CF87AB",
    "draem": "#d3d3d3",
    "peepee": "#8d00a3"
};

/**
 * Set self nickname, can only be used once per session.
 * @param {String} nick 
 */
function setNickname(nick) {
    if (nickname) throw new Error("Nickname can only be set once!");
    socket.emit("nickname", nick);
    nickname = nick;
}
socket.on('disconnect reason', reason => {
    socket.on('disconnect', () => {
        document.write("Disconnected, reason: "+reason);
    });
});
function makeChatNotific(msg) {
    new Notification(`${msg.author} oofed you!`, {body: msg.contentNoMarkdown, icon: "oof.png"});
}
socket.on("ratelimit info", info => ratelimits.message = info.message);
socket.on('chat message', msg => {
    const date = moment().format("(hh:mm:ss)");
    let content = msg.content.split("@"+nickname).join(`<strong class="msgMention">@${nickname}</strong>`);
    if (msg.author == nickname) content = msg.content;
    if (colourConfig[msg.author.toLowerCase()]) {
        msg.displayAuthor = `<span style="color:${colourConfig[msg.author.toLowerCase()]};">${msg.author}</span>`;
    } else {
        msg.displayAuthor = msg.author;
    }
    $(".messages").append(`<p class="message message${msgStyle?"A":"B"}">${date} <strong>${msg.displayAuthor} </strong>${content}</p>`);
    msgStyle = !msgStyle;
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
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
let msgQueue = [];
let msgRatelimit = 0;
setInterval(() => {
    if (!(msgRatelimit < 1)) msgRatelimit--;
    if (msgQueue.length != 0 && msgRatelimit == 0) {
        socket.emit("chat message", msgQueue.shift());
        msgRatelimit = ratelimits.message;
    }
}, 1);

setInterval(() => {
    if (typingms < 1) return;
    typingms--;
    if (typingms == 0) {
        socket.emit("typing", isTyping());
    }
}, 1);

function isTyping() {
    return typingms != 0
}
$(document).ready(() => {
$("#msgSend").toggle(false);
// Message sending
$("#msgForm").submit(e => {
    e.preventDefault();
    const content = $("#msgContent").val();
    if (content.split(" ").join("") == "") return;
    msgQueue.push(content);
    $("#msgContent").val("");
});

$("#nickForm").submit(e => {
    e.preventDefault();
    const nick = $("#nickContent").val();
    setNickname(nick);
    document.querySelector(".nickname-display").innerHTML = `Logged in as ${nickname}`; 
    $('.nickname-choose').animate({'margin-top': `-${window.outerWidth+10}px`}, 300);
    $("#msgSend").toggle(true); // show send msg button
});

$("#msgContent").on("input", () => {
    if (typingms == 0) {
        typingms = 5 * 1000;
        socket.emit("typing", isTyping());
    } else {
    typingms = 5 * 1000;
    }
});

});
