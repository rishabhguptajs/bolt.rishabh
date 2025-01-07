import express from 'express'
import dotenv from 'dotenv'
import axios from 'axios';
import { nodeBasePrompt } from './utils/node.js';
import { BASE_PROMPT, getSystemPrompt } from './utils/prompts.js';
import { reactBasePrompt } from './utils/react.js';

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
        res.json({ 
            prompt: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt],
            category: 'node'
        });
        return;
    }

    if(answer == 'react'){
        res.json({ 
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`] ,
            uiPrompts: [reactBasePrompt],
            category: 'react'
        });
        return;
    }

    res.status(403).json({ message: "Invalid question!!" });
    return;
})

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
            {
                role: "system",
                content: [
                    {
                        type: "text",
                        text: getSystemPrompt()
                    },
                    {
                        type: "text", 
                        text: "You are a creative AI assistant. When given a prompt about creating an application or feature, you should imagine and create all the necessary files and code by yourself without asking for additional requirements. Use your knowledge to make reasonable assumptions and provide a complete, working solution. Include all required code, styling, and configuration files. Make the solution production-ready with good practices and proper error handling."
                    }
                ]
            },
            ...messages.map((msg: { role: any; content: any; }) => ({
                role: msg.role,
                content: [{
                    type: "text",
                    text: msg.content
                }]
            }))
        ],
        max_tokens: 10000
    }, {
        "headers": {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        }
    })

    console.log(response.data)

    res.json({
        response: response.data
    });
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})