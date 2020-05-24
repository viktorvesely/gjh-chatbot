import CreateBlock from './components/createPipeline.js';
import ManageBlock from './components/managePipeline.js';
import ShoutBlock from './components/shoutBox.js';

import { Bus } from './helpers/bus.js';

export default {
  name: 'App',
  template: `
<div id="app-root">
  <ul class="app-wrapper">
      <li v-if='owner'>
        <create-block></create-block>
      </li>
      <li>
        <shout-block></shout-block>
      </li>
      <li v-if='owner'>
        <manage-block></manage-block>
      </li>
  </ul>
  <div class="errorsHolder">
    <div class="errorMsg" v-for="error in errors" :key="error.id">
      <span class="cross" @click="removeError(error.id)">x</span>
      <span>{{ error.msg }}</span>
    </div>
  </div>
</div>
  `,
  data: () => {
    return {
      errors: [],
      path: "/pipes-command",
      owner: false,
    }
  },
  components: {
    'create-block': CreateBlock,
    'manage-block': ManageBlock,
    'shout-block': ShoutBlock
  },
  created() {
    var context = this;
    Bus.$on('command', args => {
      context.command(args.name, args.arg).then(function() {
        args.callback ? args.callback.apply(args.ctx, arguments) : null;
      }, ()=> {
      });
    })
    Bus.$on('error', err=> {
      context.popErrorMsg(err);
    });

    this.getOwner();
  },
  methods: {
    getOwner() {
      var context = this;
      this.command("owner").then(isOwner => {
        context.owner = isOwner;
      });
    },
    command(what, value=null) {
      return new Promise((resolve, reject) => {
        var context = this;
        $.ajax(this.path, {
          contentType: "application/json",
          data: JSON.stringify({what: what, value: value}),
          method: "POST",
          complete: (res) => {
            let response = res.responseJSON;
            if (!response.error) {
              resolve(response.value);
            } else {
              context.popErrorMsg(response.error);
              reject(response);
            }
          }
        });
      });
    },  
    removeError(id) {
      this.errors.splice(this.errors.find( error=> { return error.id === id }),1);
    },
    guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4();
    },
    popErrorMsg(msg) {
      console.error(msg);
      let cache = {msg: msg, id: this.guid()};
      this.errors.push(cache);
      setTimeout(()=> {
        this.errors.splice(this.errors.find( error=> { return error.id === cache.id }),1);
      }, 10000)
    }
  }
};