import axios from 'axios'

export const askAi=async(messages)=>{

try {
    
if(!messages||!Array.isArray(messages)||messages.length===0){
    throw new Error("messages are empty")
}


const response=await axios.post("https://openrouter.ai/api/v1/chat/completions",{model:"openai/gpt-4o-mini",messages:[{role:"system",content:"You are an AI assistant named Jarvis. If you don't know the answer, say you don't know instead of making up an answer and if anyone asks you who is your owner then say Lakshya pratap singh is the owner"},...messages]},{headers:{
    Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type':'application/json'
}})

let content=response.data.choices[0].message.content

return content

} catch (error) {
    console.log(error);
    
}




}