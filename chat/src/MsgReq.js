class MsgRequest {
    constructor(value, isMsg=true) {
        this.value = value;
        this.payload = null;
        if (isMsg) {
            this.generateMsg();
        } else {
            this.generatePostback();
        }

    }

    export() {
        return this.payload;
    }

    generatePostback() {
    
    }

    generateMsg() {
        this.payload = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender":{
                                "id": "testing_sender_psid_123"
                            },
                            "message": {
                                "text": this.value
                            }
                        }
                    ]
                }
            ]
        }
    }
}

export default MsgRequest;