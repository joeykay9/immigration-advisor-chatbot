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

app.post('/name-response', (req, res, callback) => {
    
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
    callback(null, responseObject);
})

app.listen(process.env.PORT, () => console.log(`Example app listening at http://localhost:${process.env.PORT}`))