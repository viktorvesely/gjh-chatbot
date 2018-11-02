module.exports = class SerieExecutor {
  constructor(todos, onFinish) {
    this.todos = todos;
    this.onFinish = onFinish;
    this.next();
  }
  
  next() {
    if (this.todos.length === 0) {
      this.onFinish();
    }
    this.todos[0]().then(() => {
      this.todos.splice(0, 1);
      this.next();
    });
  }
  
}