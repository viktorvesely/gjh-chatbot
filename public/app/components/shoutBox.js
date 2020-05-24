import { Bus } from '../helpers/bus.js';
import MessageBuilder from './msg_builder.js';

export default {
  name: "shoutBox",
  template: `
    <div class="shout block">
      <span class="headline">
        {{ prefix }}
      </span>
      <p class="shout-desc">
        inform your userbase about something new and exciting ❤
      </p>
      <span class="text">A message, that you want to send to the world</span>
      <div class="msg-builder">
        <div class="new-msg">

        </div>
        <div v-for="(msg, index) in msgs" :key="index">
          <div v-if="msg.type === 'text'">

          </div>
          <div v-if="msg.type === 'carousel'">

          </div>
        </div>
      </div>
      <builder>
      </builder>
      <span class="text">Select a what type of announcement you want to make</span>
      <div class="dropdown">
        <button class="shout-type-btn">{{ announcementsVisual }}</button>
        <div class="dropdown-content">
          <a v-for="(a, index) in announcements" :key="index" @click="selectAnnoucement(a)">{{ a.display }}</a>
        </div>
      </div>
      <div class="spacer" height="50px"></div>
      <span class="text">Select for whom is the message intended</span>
      <div class="groups">
        <div class="centerwrapper">
          <div class="group" v-for="(group, index) in groups" :key="index" @click="selectGroup(group)" :class="group.selected ? 'selected' : ''">
            {{ group.display }}
          </div>
        </div>
      </div>
      <div class="spacer" height="50px"></div>
      <div class="shout-btn" @click="shout()">
        Shout!
      </div>
    </div>
  `,
  data() {
    return {
      prefix: "",
      msgs: [],
      shoutText: "",
      groups: [],
      shoutTypeVisual: "Select a type",
      groupsSelected: [],
      announcements: [],
      announcementsVisual: "hover me",
      announcementSelected: "",
    }
  },
  methods: {
    getPrefix() {
      Bus.$emit("command", {name: "prefix", callback: prefix => {
        this.prefix = prefix;
      }, ctx: this});
    },
    shout () {
      if (!this.shoutText) return this.popErrorMsg("Shout text cannot be empty");
      if (!this.announcementSelected) return this.popErrorMsg("Select a announcement type");
      this.groups.forEach(group => {
        if (group.selected) {
          this.groupsSelected.push(group.name);
        }
      })
      if (this.groupsSelected.length === 0) return this.popErrorMsg("Select a group");
      
      var context = this;
      this.command("shout", {
        type: this.announcementSelected,
        groups: this.groupsSelected,
        msg: this.shoutText
      }).then(nAffected => {
        console.log(`${nAffected} users were affected`);
      },()=>{});
    },
    setGroups() {
      Bus.$emit("command", {name: "getGroups", callback: groups => {
        this.groups = groups.map(group => {
          group.selected = false;
          return group;
        });
      }, ctx: this});
    },
    setAnnouncements() {
      Bus.$emit("command", {name: "getAnnouncements", callback: announcements => {
        this.announcements = announcements;
      }, ctx: this});
    },
    selectAnnoucement(a) {
      this.announcementsVisual = a.display;
      this.announcementSelected = a.name;
    },
    selectGroup(group) {
      group.selected = !group.selected;
    },
    popErrorMsg(err) {
      Bus.$emit("error", err);
    },
    setBuilder() {
      Bus.$emit("command", { name: "builder", callback: response => {
        let builder = JSON.parse(response);
        builder.forEach(template => {
          eval(template);
        });
      }, ctx: this});
    }
  },
  created() {
    this.getPrefix();
    this.setAnnouncements();
    this.setGroups();
    this.setBuilder();
  },
  components: {
    'builder': MessageBuilder
  }
  
}