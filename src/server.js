import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/name-response', (context, event, callback) => {
    
    let name = event.Field_name_Value
    
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