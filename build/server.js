"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

_dotenv["default"].config();

var app = (0, _express["default"])();
app.get('/', function (req, res) {
  return res.send('Hello World!');
});
app.get('/name-response', function (context, event, callback) {
  var name = event.Field_name_Value;
  var responseObject = {
    "actions": [{
      "say": name + " 😊. That's a lovely name."
    }, {
      "say": "What is your nationality?"
    }, {
      "listen": {
        "tasks": ["respond_to_nationality"]
      }
    }]
  };
  callback(null, responseObject);
});
app.listen(process.env.PORT, function () {
  return console.log("Example app listening at http://localhost:".concat(process.env.PORT));
});
//# sourceMappingURL=server.js.map