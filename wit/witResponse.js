const INTEND_CONFIDENCE_TRESHOLD = 0.7;
const ENTITY_CONFIDENCE_TRESHOLD = 0.7;

class WitEntity {
  constructor(entity) {
    this._exist = !!entity 
    this.entity = entity;
  }
  
  exist() {
    return this._exist;
  }
  
  countValues() {
    return this.exist() ?  this.entity.length : 0;
  }

  /**
  * Returns the values of the entity
  * @return {array} strings that were in the query
  */
  getValues() {
    values = [];
    this.entity.forEach(item => {
      if (item.confidence < ENTITY_CONFIDENCE_TRESHOLD) return;
      values.push(item.value);
    });
    return values;
  }
}

class WitResponse {
  constructor(response=null) {
    this.response = response;
    this.entities = null;

    if (!response) return this;

    this.initEntitites(response.entities)
  }

  initEntitites(entities) {
    this.entities = {};
    for (let key in entities) {
      this.entities[key] = new WitEntity(this.response.entities[key]);
    }
  }

  fromEntities(entities) {
    this.initEntitites(entities);
    return this;
  }

  countEntities() {
    return Object.keys(this.entities.length).length;
  }


  /**
  * Returns the most confident intent with its confident value or NO_INTENT or null if soemthing failed
  */
  intent() {
    if (!this.response) return null;
    let intent = this.response.intents[0];
    
    if (!intent) {
      return this.NO_INTENT;
    }

    let isConfident = intent.confidence >= INTEND_CONFIDENCE_TRESHOLD
    return [intent.name, isConfident];
  }
  
  get(name) {
    let exist = this.entities.hasOwnProperty(name);
    return exist ? this.entities[name] : WitEntity(null);
  }
}

WitResponse.prototype.NO_INTENT = -1;

module.exports = WitResponse;