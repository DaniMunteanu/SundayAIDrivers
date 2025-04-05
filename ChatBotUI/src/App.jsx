import { useEffect, useRef, useState } from "react"
import ChatbotIcon from "./components/ChatbotIcon"
import ChatForm from "./components/ChatForm"
import ChatMessage from "./components/ChatMessage"
import ReactMarkdown from "react-markdown";

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

  
    
  }

  //Autoscroll la chat updates
  useEffect(() => {
    chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior: "smooth"});
  }, [chatHistory]);

  return (
    <div id="app-container">
      <div id="title-container">
        <h2 id="app-title">AI Sunday Drivers</h2>
      </div>
      <div className={`bot-container ${showChatBot ? "show-chatbot" : ""}`}>
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
    </div>
  )
}

export default App