"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _express = _interopRequireWildcard(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _routes = _interopRequireDefault(require("./routes"));

_dotenv["default"].config();

var app = (0, _express["default"])();
var router = (0, _express.Router)();

var bodyParserJSON = _bodyParser["default"].json();

var bodyParserURLEncoded = _bodyParser["default"].urlencoded({
  extended: true
});

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);
router.use(function (req, res, next) {
  console.log(req.body);

  if (req.body.CurrentTaskConfidence <= 0.5) {
    var responseObject = {
      "actions": [{
        "redirect": "task://fallback"
      }]
    };
    return res.json(responseObject);
  }

  next();
});
router.get('/', function (req, res) {
  return res.send('Hello World!');
});
(0, _routes["default"])(router);
app.use(router);
app.listen(process.env.PORT, function () {
  return console.log("Immibot listening on port ".concat(process.env.PORT));
});
//# sourceMappingURL=server.js.map