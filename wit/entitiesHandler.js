class WitEntity {
  constructor(entity) {
    this._exist = !!entity 
    this.entity = entity;
  }
  
  exist() {
    return this._exist;
  }
  
  count() {
    return this.exist() ?  this.entity.length : 0;
  }
  
  confidence(id) {
    let i = id ? id : 0
    return this.entity[i].confidence;
  }
  
  confident(settings) {
    let treshold, any, id;
  
    if (settings) {
      
    }
    
    treshold = treshold ? treshold : this.DEFAULTCONFIDENCETRESHOLD;
    any = any ? any : false;
    id = id ? id : 0;
    return 
  }
  
}

class WitEntities {
  constructor(entities) {
    this.entities = entities;
  }
  
  exist(name) {
    return this.get(name).exist();
  }
  
  names
  
  get(name) {
    let exist = this.entities.hasOwnProperty(name);
    if (exist) return WitEntity(this.entities[name]);
    else return WitEntity(null);
  }
}


WitEntity.prototype.DEFAULTCONFIDENCETRESHOLD = 0.6;

module.exports = WitEntities;