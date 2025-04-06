import ChatbotIcon from "./ChatbotIcon"
import ReactMarkdown from 'react-markdown'

const ChatMessage = ({chat}) => {
  return (
    <div className={`message ${chat.role === "model" ? 'bot' : 'user'}-message`}>
        {chat.role === "model" && <ChatbotIcon />}
        <p className="message-text">
        <ReactMarkdown>{chat.text}</ReactMarkdown> 
        </p>
    </div>
  )
}

export default ChatMessage