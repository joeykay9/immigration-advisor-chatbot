"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

_dotenv["default"].config();

var app = (0, _express["default"])();

var bodyParserJSON = _bodyParser["default"].json();

var bodyParserURLEncoded = _bodyParser["default"].urlencoded({
  extended: true
});

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);
app.get('/', function (req, res) {
  return res.send('Hello World!');
});
app.post('/name-response', function (req, res) {
  console.log(req.body);
  var name = req.body.Field_name_Value;
  var responseObject = {
    "actions": [{
      "say": name + " 😊. That's a lovely name."
    }, {
      "say": "What is your nationality or which country are you from?"
    }, {
      "listen": {
        "tasks": ["respond_to_nationality"]
      }
    }]
  };
  return res.json(responseObject);
});
app.post('/nationality-response', function (req, res) {
  var nationality = req.body.Field_nationality_Value;
  console.log(req.body);
  var eea_countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Republic of Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland"];
  var eea_nationalities = ["Austrian", "Belgian", "Bulgarian", "Croatian", "Cypriot", "Czech", "Danish", "Estonian", "Finnish", "French", "German", "Greek", "Hungarian", "Icelandic", "Irish", "Italian", "Latvian", "Liechtenstein", "Lithuanian", "Luxembourger", "Maltese", "Dutch", "Norwegian", "Polish", "Portugese", "Romanian", "Slovak", "Slovenian", "Spanish", "Swedish", "Swiss"];

  function isEAA(string) {
    return string.toLowerCase() == nationality.toLowerCase();
  }

  var responseObject = {
    "actions": [{
      "say": "Ok. Great."
    }, {
      "say": "Why do you want to come to the UK?"
    }, {
      "listen": {
        tasks: ["respond_to_purpose_for_entry"]
      }
    }]
  };

  if (eea_countries.find(isEAA) || eea_nationalities.find(isEAA)) {
    responseObject = {
      "actions": [{
        "say": "You do not need a visa to come to the UK. 😊"
      }, {
        "redirect": "task://goodbye"
      }]
    };
  }

  return res.json(responseObject);
});
app.listen(process.env.PORT, function () {
  return console.log("Example app listening at http://localhost:".concat(process.env.PORT));
});
//# sourceMappingURL=server.js.map