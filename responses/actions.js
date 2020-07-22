class Actions {
    constructor(sendMessage, sendImage=null, sendButtons=null, sendWait=null) {
        this.sendMessage = sendMessage;
        this.sendButtons = sendButtons || sendMessage;
        this.sendImage = sendImage || sendMessage;
        this.sendWait = sendWait || sendMessage;
    }
}

module.exports = Actions;