import dotenv from "dotenv"
import express from "express"
import bodyParser from 'body-parser'

dotenv.config()

const app = express()
const bodyParserJSON = bodyParser.json();
const bodyParserURLEncoded = bodyParser.urlencoded({ extended: true });

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/name-response', (req, res) => {
    
    console.log(req.body)

    let name = req.body.Field_name_Value

    if(!(name)){ //user entered two words instead of one
        name = req.body.CurrentInput.split(' ')[0]
    }
    
    const responseObject = {
        "actions": [
            {
                "remember": {
                    "name": name
                }
            },
            {
                "say": name + " 😊. That's a lovely name."
            },
            {
                "say": "What is your nationality or what country are you from?"
            },
            {
                "listen": {
                    "tasks": [
                        "respond_to_nationality"
                    ]
                }
            },
        ]
    };
    
    return res.json(responseObject)
})

app.post('/nationality-response', (req, res) => {

    let nationality = req.body.Field_nationality_Value

    if(!(nationality)){ //user entered string which is not a country
        nationality = req.body.Field_language_Value

        if(!(nationality)) //user entered string which is not a language
            nationality = req.body.CurrentInput
    }

    console.log(req.body)
    
    let eea_countries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Republic of Cyprus", "Czech Republic", 
                "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", 
                "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", 
                "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland"]

    let eea_nationalities = ["Austrian", "Belgian", "Bulgarian", "Croatian", "Cypriot", "Czech", "Danish", "Estonian",
                "Finnish", "French", "German", "Greek", "Hungarian", "Icelandic", "Irish", "Italian", "Latvian", 
                "Liechtenstein", "Lithuanian", "Luxembourger", "Maltese", "Dutch", "Norwegian", "Polish", 
                "Portugese", "Romanian", "Slovak", "Slovenian", "Spanish", "Swedish", "Swiss"]
    
    function isEAA(string){
        return string.toLowerCase() == nationality.toLowerCase()
    }      
    
    let responseObject = {
        "actions": [
            {
                "remember": {
                    "nationality": nationality
                }
            },
    		{
    			"say": "Ok. Great."
    		},
    		{
    			"say": "Why do you want to come to the UK?"
    		},
    		{
    			"listen": {
    			    tasks: [
    			        "respond_to_purpose_for_entry"
    		        ]
    			}
    		},
        ]
    };
    
    if(eea_countries.find(isEAA) || eea_nationalities.find(isEAA)){
        responseObject = {
            "actions": [
        		{
        			"say": "Looks like you do not need a visa to come to the UK. 😊"
        		},
        		{
        			"redirect": "task://goodbye"
        		}
            ]
        };
    }
    
    return res.json(responseObject)
})

app.post('/purpose-response', (req, res) => {

    console.log(req.body)

    let purpose = req.body.Field_purpose_Value

    let responseObject = {}

    if(purpose == "Study"){

        responseObject = {
            "actions": [
                {
                    "say": "Great."
                },
                {
                    "say": "How many months are you planning to study in the UK for?"
                },
                {
                    "listen": {
                        tasks: [
                            "respond_to_study_duration"
                        ]
                    }
                },
            ]
        };
    }
    
    return res.json(responseObject)
})

app.post('/study-duration-response', (req, res) => {

    let nationality = req.body.nationality //Get user's nationality from memory
    let months = req.body.Field_months_Value //Get study duration (number of months) from user's answer

    console.log(nationality)
    
    let six_months_visa_free_countries = ["Andorra", "Antigua and Barbuda", "Argentina", "Australia",
        "Bahamas", "Barbados", "Belize", "Botswana", "Brazil", "Brunei", "Canada", "Chile", "Costa Rica", 
        "Dominica", "East Timor", "El Salvador", "Grenada", "Guatemala", "Honduras", "Hong Kong", "Israel", 
        "Japan", "Kiribati", "Macau", "Malaysia", "Maldives", "Marshall Islands", "Mauritius", "Mexico", 
        "Micronesia", "Monaco", "Namibia", "Nauru", "New Zealand", "Nicaragua", "Palau", "Panama", 
        "Papua New Guinea", "Paraguay", "Saint Kitts and Nevis", "Saint Lucia", 
        "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Seychelles", "Singapore", "Solomon Islands", 
        "South Korea", "Taiwan", "Tonga", "Trinidad and Tobago", "Tuvalu", "United States of America", 
        "Uruguay", "Vanuatu", "Vatican City"]

    function isSixMonthsVisaFreeCountry(string){ //Check if nationality is part of six month visa free countries
        return string.toLowerCase() == nationality.toLowerCase()
    }

    let responseObject = {}

    if(six_months_visa_free_countries.find(isSixMonthsVisaFreeCountry) && months <= 6){
        responseObject = {
            "actions": [
                {
                    "say": "Looks like you do not need a visa to come to the UK. 😊"
                },
                {
                    "redirect": "task://goodbye"
                }
            ]
        };
    } else if(!(six_months_visa_free_countries.find(isSixMonthsVisaFreeCountry)) && months <= 6){
        responseObject = {
            "actions": [
                {
                    "say": "You will need to apply for a Short-term study visa if you are studying for 6 months or less."
                },
                {
                    "redirect": "task://goodbye"
                }
            ]
        };
    } else if(months > 6) {
        responseObject = {
            "actions": [
                {
                    "say": "Alright, great."
                },
                {
                    "say": "How old are you?"
                },
                {
                    "listen": {
                        tasks: [
                            "respond_to_age"
                        ]
                    }
                },
            ]
        };
    }

    return res.json(responseObject)
})

app.post('/age-response', (req, res) => {

    let age = req.body.Field_age_value

    let responseObject = {}

    if(age >= 16){
        responseObject = {
            "actions": [
                {
                    "say": "You will need to apply for the Tier 4 (General) Student visa."
                },
                {
                    "remember": {
                        "section": "Tier 4 (General) Student" //to be used to query the database
                    }
                },
                {
                    "say": "Do you want to know the requirements and conditions for a successful Tier 4 (General) Student visa application?"
                },
                {
                    "listen": {
                        tasks: [
                            //"tier-4-requirements-and-conditions",
                            "goodbye" //just for testing
                        ]
                    }
                },
            ]
        }
    } else {
        responseObject = {
            "actions": [
                {
                    "say": "You will need to apply for the Tier 4 (Child) Student visa."
                },
                {
                    "redirect": "task://goodbye"
                }
            ]
        }
    }
    
    return res.json(responseObject)
})

app.listen(process.env.PORT, () => console.log(`Example app listening at http://localhost:${process.env.PORT}`))