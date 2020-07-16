"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

_dotenv["default"].config();

var app = (0, _express["default"])();

var bodyParserJSON = _bodyParser["default"].json();

var bodyParserURLEncoded = _bodyParser["default"].urlencoded({
  extended: true
});

var driver = _neo4jDriver["default"].driver(process.env.AURA_ENDPOINT, _neo4jDriver["default"].auth.basic(process.env.AURA_USERNAME, process.env.AURA_PASSWORD), {
  encrypted: true
});

var session = driver.session();

var readRulesBySection = function readRulesBySection(sectionTitle) {
  var query = "\n        MATCH (s:Section {title: $sectionTitle}), (p:Paragraph), (r:Rule)\n        WHERE (s)-[:CONTAINS]->(p) AND (p)-[:CONTAINS]->(r) \n        RETURN r";
  return session.readTransaction(function (tx) {
    return tx.run(query, {
      sectionTitle: sectionTitle
    });
  });
};

var readRulesByParagraph = function readRulesByParagraph(paragraphIndex) {
  var query = "\n        MATCH (p:Paragraph {index: $paragraphIndex}), (r:Rule)\n        WHERE (p)-[:CONTAINS]->(r) \n        RETURN r";
  return session.readTransaction(function (tx) {
    return tx.run(query, {
      paragraphIndex: paragraphIndex
    });
  });
};

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);
app.get('/', function (req, res) {
  return res.send('Hello World!');
});
app.post('/name-response', function (req, res) {
  console.log(req.body);
  var firstName = req.body.Field_firstName_Value;
  var responseObject = {
    "actions": [{
      "remember": {
        "name": firstName
      }
    }, {
      "say": firstName + " 😊. That's a lovely name."
    }, {
      "say": "What is your nationality or what country are you from?"
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

  if (!nationality) {
    //user entered string which is not a country
    nationality = req.body.Field_language_Value;
    if (!nationality) //user entered string which is not a language
      nationality = req.body.CurrentInput;
  }

  console.log(req.body);
  var eea_countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Republic of Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland"];
  var eea_nationalities = ["Austrian", "Belgian", "Bulgarian", "Croatian", "Cypriot", "Czech", "Danish", "Estonian", "Finnish", "French", "German", "Greek", "Hungarian", "Icelandic", "Irish", "Italian", "Latvian", "Liechtenstein", "Lithuanian", "Luxembourger", "Maltese", "Dutch", "Norwegian", "Polish", "Portugese", "Romanian", "Slovak", "Slovenian", "Spanish", "Swedish", "Swiss"];

  function isEAA(string) {
    return string.toLowerCase() == nationality.toLowerCase();
  }

  var responseObject = {
    "actions": [{
      "remember": {
        "nationality": nationality
      }
    }, {
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
        "say": "Looks like you do not need a visa to come to the UK. 😊"
      }, {
        "redirect": "task://goodbye"
      }]
    };
  }

  return res.json(responseObject);
});
app.post('/purpose-response', function (req, res) {
  console.log(req.body);
  var purpose = req.body.Field_purpose_Value;
  var responseObject = {};

  if (purpose == "Study") {
    responseObject = {
      "actions": [{
        "say": "Great."
      }, {
        "say": "How many months are you planning to study in the UK for?"
      }, {
        "listen": {
          tasks: ["respond_to_study_duration"]
        }
      }]
    };
  } else {
    responseObject = {
      "actions": [{
        "say": "I'm sorry I will not be able to help you."
      }, {
        "say": "Currently, I'm trained to give immigration advice concerning study only. I hope to get more training with time."
      }, {
        "redirect": "task://goodbye"
      }]
    };
  }

  return res.json(responseObject);
});
app.post('/study-duration-response', function (req, res) {
  var nationality = JSON.parse(req.body.Memory).nationality; //Get user's nationality from memory

  var months = req.body.Field_months_Value; //Get study duration (number of months) from user's answer

  console.log(nationality);
  var six_months_visa_free_countries = ["Andorra", "Antigua and Barbuda", "Argentina", "Australia", "Bahamas", "Barbados", "Belize", "Botswana", "Brazil", "Brunei", "Canada", "Chile", "Costa Rica", "Dominica", "East Timor", "El Salvador", "Grenada", "Guatemala", "Honduras", "Hong Kong", "Israel", "Japan", "Kiribati", "Macau", "Malaysia", "Maldives", "Marshall Islands", "Mauritius", "Mexico", "Micronesia", "Monaco", "Namibia", "Nauru", "New Zealand", "Nicaragua", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Seychelles", "Singapore", "Solomon Islands", "South Korea", "Taiwan", "Tonga", "Trinidad and Tobago", "Tuvalu", "United States of America", "Uruguay", "Vanuatu", "Vatican City"];

  function isSixMonthsVisaFreeCountry(string) {
    //Check if nationality is part of six month visa free countries
    return string.toLowerCase() == nationality.toLowerCase();
  }

  var responseObject = {};

  if (six_months_visa_free_countries.find(isSixMonthsVisaFreeCountry) && months <= 6) {
    responseObject = {
      "actions": [{
        "say": "Looks like you do not need a visa to come to the UK. 😊"
      }, {
        "redirect": "task://goodbye"
      }]
    };
  } else if (!six_months_visa_free_countries.find(isSixMonthsVisaFreeCountry) && months <= 6) {
    responseObject = {
      "actions": [{
        "say": "You will need to apply for a Short-term study visa if you are studying for 6 months or less."
      }, {
        "redirect": "task://goodbye"
      }]
    };
  } else if (months > 6) {
    responseObject = {
      "actions": [{
        "say": "Alright, great."
      }, {
        "say": "How old are you?"
      }, {
        "listen": {
          tasks: ["respond_to_age"]
        }
      }]
    };
  }

  return res.json(responseObject);
});
app.post('/age-response', function (req, res) {
  console.log(req.body);
  var age = req.body.Field_age_Value;
  console.log(age);
  var responseObject = {};

  if (age >= 16) {
    responseObject = {
      "actions": [{
        "say": "You will need to apply for the Tier 4 (General) Student visa."
      }, {
        "remember": {
          "section": "Tier 4 (General) Student" //to be used to query the database

        }
      }, {
        "say": "Do you want to know the requirements and conditions for a successful Tier 4 (General) Student visa application under the Point Based System?"
      }, {
        "listen": {
          tasks: ["tier-4-requirements-and-conditions"]
        }
      }]
    };
  } else {
    responseObject = {
      "actions": [{
        "say": "You will need to apply for the Tier 4 (Child) Student visa."
      }, {
        "redirect": "task://goodbye"
      }]
    };
  }

  return res.json(responseObject);
});
app.post('/tier-4-requirements-and-conditions', function (req, res) {
  var response = req.body.Field_response_Value;
  var responseObject = {};

  if (response == "Yes") {
    responseObject = {
      "actions": [{
        "redirect": "task://purpose-of-route"
      }]
    };
    return res.json(responseObject);
  } else {
    responseObject = {
      "actions": [{
        "redirect": "task://goodbye"
      }]
    };
    return res.json(responseObject);
  }
});
app.post('/tier-4-requirements-and-conditions/:paragraph', function (req, res) {
  var paragraph = req.params.paragraph;
  var paragraphIndex = "dummy text";
  var nextRoute = "dummy route";

  if (paragraph == 'purpose-of-route') {
    paragraphIndex = '245ZT';
    nextRoute = 'entry-clearance';
  } else if (paragraph == 'entry-clearance') {
    paragraphIndex = '245ZU';
    nextRoute = 'entry-clearance-requirements';
  } else if (paragraph == 'entry-clearance-requirements') {
    paragraphIndex = '245ZV';
    nextRoute = 'entry-clearance-grant-period-and-conditions';
  } else if (paragraph == 'entry-clearance-grant-period-and-conditions') {
    paragraphIndex = '245ZW';
    nextRoute = 'leave-to-remain-requirements';
  } else if (paragraph == 'leave-to-remain-requirements') {
    paragraphIndex = '245ZX';
    nextRoute = 'leave-to-remain-grant-period-and-conditions';
  } else if (paragraph == 'leave-to-remain-requirements') {
    paragraphIndex = '245ZY';
    nextRoute = 'goodbye';
  }

  console.log(paragraphIndex);
  var actions = [];
  var responseObject = {};
  readRulesByParagraph(paragraphIndex).then(function (results) {
    var records = results.records.map(function (record) {
      return record._fields[0];
    });
    var rules = records.map(function (record) {
      return record.properties.desc;
    });
    rules.forEach(function (rule) {
      var say = {
        "say": rule
      };
      actions.push(say);
    });
    var redirect = {
      "redirect": "task://" + nextRoute
    };
    actions.push(redirect);
    responseObject = {
      "actions": actions
    };
    console.log(responseObject);
    return res.json(responseObject);
  }); // .finally(() => session.close());
});
app.listen(process.env.PORT, function () {
  return console.log("Example app listening at http://localhost:".concat(process.env.PORT));
});
//# sourceMappingURL=server.js.map