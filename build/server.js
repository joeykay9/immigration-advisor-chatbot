"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var app = (0, _express["default"])();
var port = 3000;
app.get('/', function (req, res) {
  return res.send('Hello World!');
});
app.get('/name-response', function (req, res) {
  return res.send('Pending Twilio function');
});
app.listen(port, function () {
  return console.log("Example app listening at http://localhost:".concat(port));
});
//# sourceMappingURL=server.js.map