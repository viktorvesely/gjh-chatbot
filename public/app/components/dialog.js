 import { Bus } from '../helpers/bus.js';

export default {
  name: "dialogBox",
  template: `
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper" @click="$emit('close')">
          <div class="modal-container" @click="$event.stopPropagation()">
            <div class="modal-header">
              <slot name="header">
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
              </slot>
            </div>

            <div class="modal-footer">
              <slot name="footer">
  
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  `
}