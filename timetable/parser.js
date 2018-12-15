module.exports = class Parser {
  constructor(timeTable) {
    this.table = timeTable;
    this.changes = timeTable.changes;
    this.order = timeTable.order;
  }
  
  build(classId) {
    
  }

  getTableRows(name) {
    for (let i = 0; i < this.changes.length; ++i) {
      let change = this.changes[i];
      if (change.table === name) {
        return change.rows;
      }
    }
    return -1;
  }

  getLessonsByClassId(id) {
    let lessons = this.getTableRows("lessons");
    let retLessons = [];
    for (let i = 0; i < lessons.length; ++i) {
      let lesson = lessons[i];
      if (lesson.classids.includes(id)) {
        retLessons.push(lesson);
      }
    }
    return retLessons;
  }

  getSubject(id) {
    let subjects = this.getTableRows("subjects");
    for (let i = 0; i < subjects.length; ++i) {
      let subject = subjects[i];
      if (subject.id === id) {
        return subject;
      }
    }
    return -1;
  }

  getClass(id) {
    let classes = this.getTableRows("classes");
    for (let i = 0; i < classes.length; ++i) {
      let Class = classes[i];
      if (Class.id === id) {
        return Class;
      }
    }
    return -1;
  }
}