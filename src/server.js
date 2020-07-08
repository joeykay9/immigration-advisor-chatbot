import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/name-response', (req, res) => res.send('Pending Twilio function'))

app.listen(process.env.PORT, () => console.log(`Example app listening at http://localhost:${process.env.PORT}`))