class PipelineManager {
  constructor(userId) {
    this.user = userId;
  }
  
  createPipeline(task) {
    if (!this.isOwner()) return;
    
  }
  
  isOwner() {
    return this._owner === this.user;
  }
  
  database() {
  
  }
  
}

PipelineManager.prototype._owner = "XXXX-JURKO-hronko-chatbot-owner-#123!!-XXXX";

module.exports = PipelineManager;