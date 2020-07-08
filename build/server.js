"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

_dotenv["default"].config();

var app = (0, _express["default"])();
app.get('/', function (req, res) {
  return res.send('Hello World!');
});
app.get('/name-response', function (req, res) {
  return res.send('Pending Twilio function');
});
app.listen(process.env.PORT, function () {
  return console.log("Example app listening at http://localhost:".concat(process.env.PORT));
});
//# sourceMappingURL=server.js.map