module.exports = class Cache {
  constructor() {
    this.cache = {};
  }

  set(sender_psid, what, value) {
    if (!this.cache.hasOwnProperty(sender_psid)) {
      this.cache[sender_psid] = {};
    }
    this.cache[sender_psid][what] = value;
  }
  get(sender_psid, what, keep=false) {
    if (!this.cache[sender_psid]) return undefined;
    
    let retVal = this.cache[sender_psid][what];
    if (!keep) this.cache[sender_psid][what] = undefined;
    
    return retVal;
  }
}