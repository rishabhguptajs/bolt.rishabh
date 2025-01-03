import axios from "axios";
import dotenv from 'dotenv'
import { getSystemPrompt } from "./prompts.js";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const talkToLLM = async() => {
    try {
      console.log(OPENROUTER_API_KEY)
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: "meta-llama/llama-3-8b-instruct:free",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "Create a simple todo application in html css for me and use local storage to store the data persistently."
                      }
                    ]
                  },
                  {
                    role: "system",
                    content: [
                      {
                        type: "text",
                        text: getSystemPrompt()
                      }
                    ]
                  }
                ]}, {
                    "headers": {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
        )

        console.log(response.data.choices[0].message.content)
    } catch (error: any) {
        console.log(error.message)
    }
}

export { talkToLLM }