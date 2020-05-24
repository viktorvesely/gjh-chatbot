class Substitution {
  constructor() {
    this.substitution = null;
    this.onLoad = null;
  }
  
  
  get() {
    return this.load();
  }
  
  load() {
    this.onLoad = new Promise((resolve , reject) => {
         
    });
    return this.onLoad;
  }
  
}

module.exports = Substitution;