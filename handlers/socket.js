class Socket {
    constructor(io, Pendings) {
        this.io = io;
        this.connections = {};
        this.Pendings = Pendings;

        io.on('connection', socket =>{
            socket.on("identify", sender_psid => {
                this.connections[sender_psid] = socket;
                socket.__sender_psid_chat_bot = sender_psid;
                this.Pendings.hasPendings(sender_psid).then(has => {
                    if (has) this.new_message(sender_psid);
                    else this.no_messages(sender_psid);
                });
            });
            socket.on("disconnect", () => {
                this.connections[socket.__sender_psid_chat_bot] = undefined;
            });
        });
    }

    no_messages(sender_psid) {
        let socket = this.connections[sender_psid];
        if (socket) {
            socket.emit('no_messages');
            return true;
        }
        return false;
    }

    new_message(sender_psid) {
        let socket = this.connections[sender_psid];
        if (socket) {
            socket.emit('new_message');
            return true;
        }
        return false;
    }
}

module.exports = Socket;