import { Bus } from '../helpers/bus.js';

export default {
  name: "createBlock",
  template: `
    <div class="create block" :class="createHover ? 'create-hover' : ''" @mouseenter="createHover = true" @mouseleave="createHover = false">
      <span class="plus" v-if="!createHover">
        +
      </span>
      <div class="create-pipeline" v-if="createHover">
        <h1>
          Create a new message pipeline
        </h1>
        <input type="text">
        <input type="text">
        <div class="create-button" @click="createPipeline()">

        </div>
      </div>
    </div>
  `,
  data() {
    return {
      createHover: false,
    }
  },
  methods: {
    createPipeline() {
    
    }
  }
  
}