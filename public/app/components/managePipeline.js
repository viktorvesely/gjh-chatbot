import { Bus } from '../helpers/bus.js';

export default {
  name: "manageBlock",
  template: `
    <div class="menu block" :class="menuHover ? 'menu-hover' : ''" @mouseenter="menuHover = true" @mouseleave="menuHover = false">
      <div class="pipelines">
        <div class="pipline" v-for="(pipe, index) in pipelines">
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      pipelines: [],
      menuHover: false
    }
  },
  created() {
    Bus.$emit("command", {name: "getAll", callback: pipelines => {
      this.pipelines = pipelines;
    }, ctx: this});
  }
  
}