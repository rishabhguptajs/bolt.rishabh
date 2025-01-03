import express from 'express'
import dotenv from 'dotenv'
import { talkToLLM } from './utils/talkToLLM.js'

dotenv.config();

talkToLLM();

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send("API is running!!")
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})