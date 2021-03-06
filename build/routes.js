"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _queries = require("./queries");

var routes = function routes(router) {
  router.post('/name-response', function (req, res) {
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
        "say": "What is your country of citizenship or what country are you from?"
      }, {
        "listen": {
          "tasks": ["respond_to_nationality"]
        }
      }]
    };
    return res.json(responseObject);
  });
  router.post('/nationality-response', function (req, res) {
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
  router.post('/purpose-response', function (req, res) {
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
  router.post('/study-duration-response', function (req, res) {
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
  router.post('/age-response', function (req, res) {
    var age = req.body.Field_age_Value;
    var paragraphIndex = '245ZT';
    var responseObject = {};
    var actions = [];

    if (age >= 16) {
      var say = {
        "say": "You will need to apply for the Tier 4 (General) Student visa."
      };
      actions.push(say);
      (0, _queries.readRulesByParagraph)(paragraphIndex).then(function (results) {
        var records = results.records.map(function (record) {
          return record._fields[0];
        });
        var rules = records.map(function (record) {
          return record.properties.desc;
        });
        rules.forEach(function (rule) {
          say = {
            "say": rule
          };
          actions.push(say);
        });
        say = {
          "say": "Are you currently in the UK?"
        };
        actions.push(say);
        var listen = {
          "listen": {
            tasks: ["respond_to_current_location"]
          }
        };
        actions.push(listen);
        responseObject = {
          "actions": actions
        };
        return res.json(responseObject);
      });
    } else {
      responseObject = {
        "actions": [{
          "say": "You will need to apply for the Tier 4 (Child) Student visa."
        }, {
          "redirect": "task://goodbye"
        }]
      };
      return res.json(responseObject);
    }
  });
  router.post('/current-location-response', function (req, res) {
    console.log(req.body);
    var response = req.body.Field_response_Value;
    console.log(response);
    var responseObject = {};

    if (response == "Yes") {
      responseObject = {
        "actions": [{
          "remember": {
            "visa_type": "Leave to remain" //to be used to query the database

          }
        }, {
          "say": "Do you want to know the requirements under the Point Based System for a successful Tier 4 (General) Student visa application to remain in the UK??"
        }, {
          "listen": {
            tasks: ["tier-4-requirements-and-conditions"]
          }
        }]
      };
    } else {
      responseObject = {
        "actions": [{
          "remember": {
            "visa_type": "Entry clearance" //to be used to query the database

          }
        }, {
          "say": "Do you want to know the requirements under the Point Based System for a successful Tier 4 (General) Student visa application to enter the UK?"
        }, {
          "listen": {
            tasks: ["tier-4-requirements-and-conditions"]
          }
        }]
      };
    }

    return res.json(responseObject);
  });
  router.post('/tier-4-requirements-and-conditions', function (req, res) {
    var response = req.body.Field_response_Value;
    var visa_type = JSON.parse(req.body.Memory).visa_type;
    var responseObject = {};

    if (response == "Yes") {
      if (visa_type == 'Entry clearance') {
        responseObject = {
          "actions": [{
            "redirect": "task://entry-clearance-requirements-intro"
          }]
        };
      } else if (visa_type == 'Leave to remain') {
        responseObject = {
          "actions": [{
            "redirect": "task://leave-to-remain-requirements-intro"
          }]
        };
      }

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
  router.post('/tier-4/paragraphs/:paragraph', function (req, res) {
    var paragraph = req.params.paragraph;
    var paragraphIndex = "";
    var nextRoute = "";
    var limit = 100; //entry clearance path
    // if (paragraph == 'entry-clearance'){
    //     paragraphIndex = '245ZU'
    //     nextRoute = 'entry-clearance-requirements-intro'
    // } 

    if (paragraph == 'entry-clearance-requirements-intro') {
      paragraphIndex = '245ZV';
      limit = 1;
      nextRoute = 'entry-clearance-grant-period-and-conditions';
    } else if (paragraph == 'entry-clearance-grant-period-and-conditions') {
      paragraphIndex = '245ZW';
      nextRoute = 'goodbye';
    } //Leave to remain path
    else if (paragraph == 'leave-to-remain-requirements-intro') {
        paragraphIndex = '245ZX';
        limit = 1;
        nextRoute = 'leave-to-remain-grant-period-and-conditions';
      } else if (paragraph == 'leave-to-remain-requirements') {
        paragraphIndex = '245ZY';
        nextRoute = 'goodbye';
      }

    console.log(paragraphIndex);
    var actions = [];
    var responseObject = {};
    (0, _queries.readRulesByParagraph)(paragraphIndex, limit).then(function (results) {
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
      var say = {
        "say": 'Do you wish to know the requirements?'
      };
      actions.push(say);
      var listen = {};

      if (paragraph == 'entry-clearance-requirements-intro') {
        listen = {
          "listen": {
            tasks: ["entry-clearance-requirements"]
          }
        };
      } else if (paragraph == 'leave-to-remain-requirements-intro') {
        listen = {
          "listen": {
            tasks: ["leave-to-remain-requirements"]
          }
        };
      }

      actions.push(listen); // let redirect = {
      //     "redirect": "task://" + nextRoute
      // }
      // actions.push(redirect)

      responseObject = {
        "actions": actions
      };
      console.log(responseObject);
      return res.json(responseObject);
    }); // .finally(() => session.close());
  });
  router.post('/tier-4/requirements/:type', function (req, res) {
    var type = req.params.type;
    var response = req.body.Field_response_Value;
    var paragraphIndex = "";
    var responseObject = {};
    var actions = [];

    if (type == "entry-clearance") {
      paragraphIndex = "245ZV";
    } else if (type = "leave-to-remain") {
      paragraphIndex = "245ZX";
    }

    if (response == "Yes") {
      (0, _queries.readRequirementsByType)(paragraphIndex).then(function (results) {
        var subRuleRecords = results.records.map(function (record) {
          return record._fields[1];
        });
        var rule = results.records[0]._fields[0].properties.desc;
        var subRules = subRuleRecords.map(function (record) {
          return record.properties.desc;
        });
        var say = {
          "say": rule
        };
        actions.push(say);
        subRules.forEach(function (subRule) {
          say = {
            "say": subRule
          };
          actions.push(say);
        });
        responseObject = {
          "actions": actions
        };
        return res.json(responseObject);
      });
    } else {
      responseObject = {
        "actions": [{
          "redirect": "task://goodbye"
        }]
      };
      return res.json(responseObject);
    }
  });
};

var _default = routes;
exports["default"] = _default;
//# sourceMappingURL=routes.js.map