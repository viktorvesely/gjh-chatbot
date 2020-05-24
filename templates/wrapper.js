const Generic = require("./generic.js");
const Button = require("./button.js");
const List = require("./list.js");
const Response = require("../responses/responseObject.js");

function class2Eval(_class) {
  return "window[\"" + _class.name + "\"] = (" + _class.toString() + ")";
}

const Wrapper = [
  class2Eval(Generic),
  class2Eval(Button),
  class2Eval(List),
  class2Eval(Response)
]
      
module.exports = JSON.stringify(Wrapper);