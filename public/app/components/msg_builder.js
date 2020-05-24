import { Bus } from '../helpers/bus.js';
import DialogBox from './dialog.js'

export default {
  name: "msgBuilder",
  template: `
<div class="msgBuilder">
  <dialog-box v-if="genericBuilderActive" v-on:close="close" v-on:done="done" v-on:next="next">
    <template v-slot:header>
      <h3>
        Carousel message
      </h3>
    </template>
    <template v-slot:body>
      <div class="builderBodyWrapper">
        <div class="iTitle">
          <input type="text" placeholder="Title" v-model="genericModelMsg.title">
        </div>
        <div class="iSubTitle">
          <input type="text" placeholder="Subtitle" v-model="genericModelMsg.subTitle">
        </div>
        <div class="iImage">
          <input type="text" placeholder="Image URL" v-model="genericModelMsg.image">
        </div>
        <div class="buttons">
          <div>
            Include buttons
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="done-btn" @click="done">Done</div>
    </template>
  </dialog-box>

  <dialog-box v-if="textBuilderActive" v-on:close="close"  v-on:done="done">
    <template v-slot:header>
      <h3>
        Text message
      </h3>
    </template>
    <template v-slot:footer>
      <div class="done-btn" @click="done">Done</div>
    </template>
  </dialog-box>
  
  <dialog-box v-if="buttonsBuilderActive" v-on:close="close" v-on:done="done">
    <template v-slot:header>
      <h3>
        Text & buttons message
      </h3>
    </template>
    <template v-slot:footer>
      <div class="done-btn" @click="done">Done</div>
    </template>
  </dialog-box>
  
  <div class="newMsg dropdown">
    <button class="shout-type-btn">New message +</button>
    <div class="newMsg dropdown-content">
      <a v-for="(msgType, index) in msgTypes" :key="index" @click="selectType(msgType)">{{ msgType.display }}</a>
    </div>
  </div>
  <div class="createdMsgs" v-for="msg in msgs" :key="msg.id">
    <div v-if="msg.type === text">
      
    </div>
    <div v-if="msg.type === generic">
      
    </div>
  </div>
</div>
  `,
  data() {
    return {
      msgs: [],
      msgTypes: [{
        display: "Generic",
        type: "generic"
      },{
        display: "Text",
        type: "text"
      },{
        display: "Text & Buttons",
        type: "buttons"
      }],
      textBuilderActive: false,
      genericBuilderActive: false,
      buttonsBuilderActive: false,
      response: null,
      currentMsg: {
        type: null,
        msg: null,
        options: null,
        display: ""
      },
      genericModelMsg: {
        title: "",
        image: "",
        buttons: [],
        subTitle: "",
      },
      buttonsModelMsg: {
        text: "",
        buttons: []
      },
      textModelMsg: {
        text: ""
      }
    }
  },
  methods: {
    selectType(msg) {
      this.currentMsg.type = msg.type;
      this.currentMsg.display = msg.display;

      this.switchType(() => {
        this.currentMsg.msg = null;
        this.genericBuilderActive = true;
      }, () => {
        this.currentMsg.msg = "";
        this.textBuilderActive = true;
      }, ()=> {
        this.currentMsg.msg = "";
        this.currentMsg.options = null;
        this.buttonsBuilderActive = true;
      });
    },
    addMsg(current) {
      let msg = current.msg;
      let options = current.options || undefined;
      let type = current.type;
      this.response ? this.response.next(type, msg, options) : (this.response = new Response(type, msg, options));
    },
    done() {
      if (this.validateMsg()) {
        this.setCurrentModel();
        this.addMsg(this.currentMsg);
        this.close();
        console.log(this.response);
      }
    },
    next() {
      this.switchType(() => {
        this.setCurrentModels();
        if (!this.validateGeneric(this.currentMsg.msg)) {
          this.currentMsgs.msg.elements.pop();
        }
      });
    },
    setCurrentModel() {
      this.switchType(() => {
        this.currentMsg.msg ? this.currentMsg.msg.next() : (this.currentMsg.msg = new Generic());
        let msg = this.currentMsg.msg;
        msg.title(this.genericModelMsg.title);
        this.genericModelMsg.subTitle ? msg.subTitle(this.genericModelMsg.subTitle) : null;
        this.genericModelMsg.image ? msg.image(this.genericModelMsg.image) : null;
        this.genericModelMsg.buttons.length > 0 ? msg.buttons(this.genericModelMsg.buttons) : null;
      }, ()=> {
        this.currentMsg.msg = this.textModelMsg.text; 
      }, ()=> {
        this.currentMsg.msg = this.buttonsModelMsg.text;
        this.currentMsg.options = this.buttonsModelMsg.buttons;
      });
    },
    close() {
      this.switchType(() => {
        this.genericBuilderActive = false;
      }, ()=> {
        this.textBuilderActive = false;
      }, () => {
        this.buttonsBuilderActive = false;
      });
    },
    switchType(genericCallback=null, textCallback=null, buttonsCallback=null, fallback = null) {
      let retVal = undefined;
      switch(this.currentMsg.type) {
        case "generic":
          retVal = genericCallback ? genericCallback() : undefined; 
          break;
        case "text":
          retVal = textCallback ? textCallback() : undefined;
          break;
        case "buttons":
          retVal = buttonsCallback ? buttonsCallback() : undefined;
          break;
        default:
          retVal = fallback ? fallback() : undefined;
          break;
      };
      return retVal;
    },
    validateGeneric(msg) {
      let valid = true;
      if (!msg.title) {
        valid = false;
        Bus.$emit("error", "Title is required");
      }
      if (msg.buttons.length > 3) {
        valid = false;
        Bus.$emit("error", "Only three buttons are allowed per msg");
      }
      if (!msg.subTitle && !msg.image) {
        valid = false;
        Bus.$emit("error", " Generic must also have one or both of image URL or subtitle set")
      }
      return valid;
    },
    validateText(msg) {
      if (!msg) {
        Bus.$emit("error", "The text is empty");
        return false
      }
      return true;
    },
    validateButtons(msg, options) {
      
    },
    validateMsg() {
      return this.switchType(() => {
        return this.validateGeneric(this.genericModelMsg);
      }, () => {
        return this.validateText(this.textModelMsg);
      }, ()=> {
        return this.validateButtons(this.buttonsModelMsg);
      });
    }
  },
  created() {
  },
  components: {
    'dialog-box': DialogBox
  }
  
}