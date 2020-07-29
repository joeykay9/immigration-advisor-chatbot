import dotenv from "dotenv"
import express, {Router} from "express"
import bodyParser from 'body-parser'
import routes from './routes'

dotenv.config()

const app = express()
const router = Router();
const bodyParserJSON = bodyParser.json();
const bodyParserURLEncoded = bodyParser.urlencoded({ extended: true });

app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);

router.use(function (req, res, next) {
    console.log(req.body)
    if(req.body.CurrentTaskConfidence <= 0.5){
        let responseObject = {
            "actions": [
                {
                    "redirect": "task://fallback"
                }
            ]
        }

        return res.json(responseObject)
    }

    next()
})

router.get('/', (req, res) => res.send('Hello World!'))

routes(router)

app.use(router)
app.listen(process.env.PORT, () => console.log(`Immibot listening on port ${process.env.PORT}`))