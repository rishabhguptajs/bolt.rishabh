import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const talkToLLM = async() => {
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "What's in this image?"
                      },
                      {
                        type: "image_url",
                        image_url: {
                          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                        }
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

        console.log(response.data)
    } catch (error: any) {
        console.log(error.message)
    }
}

export default talkToLLM;