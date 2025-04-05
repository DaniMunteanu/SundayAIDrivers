import { useEffect, useRef, useState } from "react"
import ChatbotIcon from "./components/ChatbotIcon"
import ChatForm from "./components/ChatForm"
import ChatMessage from "./components/ChatMessage"

// import OpenAI from "openai";

// const client = new OpenAI();

// const response = await client.responses.create({
//     model: "gpt-4o",
//     input: "Write a one-sentence bedtime story about a unicorn.",
// });

// console.log(response.output_text);


const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatBot, setShowChatBot] = useState(false);
  const chatBodyRef = useRef();

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const generateBotResponse = async (history) => {

    //Helper function to update chat history
    const updateHistory = (responseText) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), {role: "model", text}]);
    }

    console.log(history);

    //Format chat history for API request
    history = history.map(({role, text}) => ({role, parts: [{text}]}))

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({contents: history})
    };
    
    try{
      //Call la localhost care trimite inputul de la user si ar trebui sa primeasca raspunsul de la bot
      const response = await fetch("http://localhost:5173/save", requestOptions);
      const data = await response.json();
      ///POATE NU MERGE!!!!! pt ca se facea fetch din gemini
      if(!response.ok) throw new Error(data.error.message || "Something went wrong!");

      // Clean and update chat history with bot's response

      // AICI S-AR PUTEA SA FIE DIFERIT la data.
      const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").
      trim();

      updateHistory(responseText);

      console.log(data);
    } catch (error) {
      console.log(error);
    }
    
  }

  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:5173");
  //   setSocket(ws);

  //   ws.onopen = () => {
  //     console.log("Connected to Python WebSocket server");
  //   };

  //   ws.onmessage = (event) => {
  //     setMessages(prev => [...prev, `From Python: ${event.data}`]);
  //   };

  //   ws.onclose = () => {
  //     console.log("Disconnected");
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, []);

  // const sendMessage = () => {
  //   if (socket && socket.readyState === WebSocket.OPEN) {
  //     socket.send(input);
  //     setMessages(prev => [...prev, `Sent: ${input}`]);
  //     setInput("");
  //   }
  // };

  //Autoscroll la chat updates
  useEffect(() => {
    chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior: "smooth"});
  }, [chatHistory]);

  return (
    <div className={`container ${showChatBot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatBot((prev) => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="chatbot-popup">
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button 
            className="material-symbols-rounded">keyboard_arrow_down
          </button>
        </div>

        {/* Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">boi</p>
          </div>

        {/* Render the chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat}/>
          ))}
          
        </div>

        {/* Footer */}
        <div className="chat-footer">
          {/* generateBotResponse */}
            <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse}/>
        </div>

      </div>

    </div>
  )
}

export default App