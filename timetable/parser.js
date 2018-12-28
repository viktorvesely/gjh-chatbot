const Table = require('./table.js');

module.exports = class Parser {
  constructor(timeTable) {
    this.table = timeTable;
    this.changes = timeTable.changes;
    this.order = timeTable.order;
  }
  
  translateDay(eduDay) {
    return eduDay.indexOf("1");
  }
  
  build(classId) {
    let table = new Table(classId);
    let lessons = this.getLessonsByClassId(classId);
    lessons.forEach(lesson => {
      let duration = lesson.durationperiods;
      let teacher = this.getObject("teachers", lesson.teacherids[0]).lastname;
      let subject = this.getObject("subjects", lesson.subjectid).name;
      let cards = this.getCardsByLessonId(lesson.id);
      cards.forEach(card => {
        let day = this.translateDay(card.days);
        let period = card.period;
        let room  = this.getObject("classrooms", card.classroomids[0]).short;
        table.addLesson(day, period, duration, teacher, room, subject);
      });
    })
    table.save();
    return table;
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
  
  getCardsByLessonId(id) {
    let cards = this.getTableRows("cards");
    let retCards = [];
    for (let i = 0; i < cards.length; ++i) {
      let card = cards[i];
      if (card.lessonid === id) {
        retCards.push(card);
      }
    }
    return retCards;
  }
  
  getObject (table, id) {
    let objects = this.getTableRows(table);
    for (let i = 0; i < objects.length; ++i) {
      let object = objects[i];
      if (object.id === id) {
        return object;
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
}