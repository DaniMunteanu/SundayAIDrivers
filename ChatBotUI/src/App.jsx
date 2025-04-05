import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY } from "./google_secret.jsx";
import NeurologistIcon from "./components/NeurologistIcon.jsx";
import DentistIcon from "./components/DentistIcon.jsx";
import DermatologistIcon from "./components/DermatologistIcon.jsx";
import PedriaticianIcon from "./components/PedriaticianIcon.jsx";
import PsychologistIcon from "./components/PsychologistIcon.jsx";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatBot, setShowChatBot] = useState(false);
  const chatBodyRef = useRef();
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const getInitialPrompt = (mode) => {
    switch (mode) {
      case "pediatrician":
        return "You are now in pediatrician mode. Respond only with helpful concise, accurate medical information. Assume the user is asking medical-related questions unless stated otherwise, keep it short and you can reply with a question to get further information about the user's symptoms. When you are sure about his/her diagnosis, reply with a medical advice.";
      case "psychologist":
        return "You are now in psychologist mode. Respond only with helpful concise, accurate medical information. Assume the user is asking medical-related questions unless stated otherwise, keep it short and you can reply with a question to get further information about the user's symptoms. When you are sure about his/her diagnosis, reply with a medical advice.";
      case "dermatologist":
          return "You are now in dermatologist mode. Respond only with helpful concise, accurate medical information. Assume the user is asking medical-related questions unless stated otherwise, keep it short and you can reply with a question to get further information about the user's symptoms. When you are sure about his/her diagnosis, reply with a medical advice."
      case "dentist":
        return "You are now in dentist mode. Respond only with helpful concise, accurate medical information. Assume the user is asking medical-related questions unless stated otherwise, keep it short and you can reply with a question to get further information about the user's symptoms. When you are sure about his/her diagnosis, reply with a medical advice."
      default:
        return null;
    }
  };

  const generateBotResponse = async (history) => {
    const updateHistory = (responseText) => {
      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== "Thinking..."),
        { role: "model", text: responseText },
      ]);
    };

    // Add Doctor Mode system instruction
    const systemPrompt = {
      role: "user",
      parts: [
        {
          text: "You are now in doctor mode. Respond only with helpful concise, accurate medical information. Assume the user is asking medical-related questions unless stated otherwise, keep it short and you can reply with a question to get further information about the user's symptoms. When you are sure about his/her diagnosis, reply with a medical advice.",
        },
      ],
    };

    const formattedHistory = [
      systemPrompt,
      ...history.map(({ role, text }) => ({
        role,
        parts: [{ text }],
      })),
    ];

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      const chat = await model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(history.at(-1).text);
      const response = await result.response;
      const responseText = await response.text();

      updateHistory(responseText);
      console.log(responseText);
    } catch (error) {
      console.error("Error generating response:", error);
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <div id="app-container">
      <div id="title-container">
        <h2 id="app-title">AI Sunday Drivers</h2>
      </div>

        <div className="specialists-container">
          <ul className="mode-buttons">
            <li>
              <div className="header-info">
                <DermatologistIcon></DermatologistIcon>
                <button onClick={() => window.location.href = "?mode=dermatologist"}>Dermatologist</button>
              </div>
            </li>
            <li>
              <div className="header-info">
                <PedriaticianIcon></PedriaticianIcon>
                <button onClick={() => window.location.href = "?mode=pediatrician"}>Pediatrician</button>
              </div>
            </li>
            <li>
              <div className="header-info">
                <PsychologistIcon></PsychologistIcon>
                <button onClick={() => window.location.href = "?mode=psychologist"}>Psychologist</button>
              </div>
            </li>
            <li>
              <div className="header-info">
                <DentistIcon></DentistIcon>
                <button onClick={() => window.location.href = "?mode=dentist"}>Dentist</button>
              </div>
            </li>
          </ul>
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
          </div>

          {/* Body */}
          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
  <ChatbotIcon />
  <p className="message-text">
    {mode === "General Practitioner" && "Hello! I'm your personal General Practitioner. Ask me anything medical."}
    {mode === "pediatrician" && "Hello! I'm your personal Pediatrician . Ask me anything about child healthcare."}
    {mode === "psychologist" && "Hello! I'm your personal Psychologist. Let's talk about mental health."}
    {mode === "dentist" && "Hello! I'm your personal Dentist. Let's talk about your dental health."}
    {!mode && "Hello! I'm your helpful assistant. How can I support you today?"}
  </p>
</div>


            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>

          {/* Footer */}
          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
