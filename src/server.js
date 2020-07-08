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
    
    const responseObject = {
        "actions": [
            {
                "say": name + " 😊. That's a lovely name."
            },
            {
                "say": "What is your nationality?"
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
    
    console.log(req.body)

    let nationality = req.body.Field_name_Value
    
    let eea = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia",
                "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", 
                "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", 
                "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland"]
    
    function isEAA(country){
        return country == nationality
    }      
    
    let responseObject = {
        "actions": [
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
    
    if(eea.find(isEAA)){
        responseObject = {
            "actions": [
        		{
        			"say": "You do not need a visa to come to the UK. 😊"
        		},
        		{
        			"redirect": "task://goodbye"
        		}
            ]
        };
    }
    
    console.log(eea.find(isEAA))
    
    return res.json(responseObject)
})

app.listen(process.env.PORT, () => console.log(`Example app listening at http://localhost:${process.env.PORT}`))