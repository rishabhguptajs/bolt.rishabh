import express from 'express'
import dotenv from 'dotenv'
import axios from 'axios';

dotenv.config();

const app = express()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json())

app.get('/', (req, res) => {
    res.send("API is running!!")
})

app.post('/template', async (req, res) => {
    const { prompt } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt
                    }
                ]
            },
            {
                role: "system",
                content: [
                    {
                        type: "text",
                        text: "You have to return whether it is a node project or a react project based on your own knowledge. Try to comprehend whether the prompt requires a client side application or a server side, if its a typical client side then react else it should be of node. Just return the string, either 'node' or 'react'. Do not return anything extra or write any additional code."
                    }
                ]
            }
        ]
    }, {
        "headers": {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
        }
    })

    const answer = response.data.choices[0].message.content;

    if(answer == 'node'){
        res.json({ prompt: prompt, code: 'node' });
        return;
    }

    if(answer == 'react'){
        res.json({ prompt: prompt, code: 'react' });
        return;
    }

    res.status(403).json({ message: "Invalid question!!" });
    return;
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})