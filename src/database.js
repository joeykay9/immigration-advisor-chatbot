import dotenv from "dotenv"
import neo4j from 'neo4j-driver'
dotenv.config()

const driver = neo4j.driver(
    process.env.AURA_ENDPOINT, 
    neo4j.auth.basic(process.env.AURA_USERNAME, process.env.AURA_PASSWORD), 
    { 
        encrypted: true 
    } 
);

const session = driver.session()

export default session