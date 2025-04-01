import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMessagesByFamilyId, saveMessage } from "@/services/database";
import { format } from "date-fns";

interface FormattedMessage {
  id: string;
  sender: {
    name: string;
    avatar?: string;
    initials: string;
  };
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const ChatMessage = ({ message }: { message: FormattedMessage }) => {
  return (
    <div
      className={`flex ${
        message.isCurrentUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      {!message.isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
          <AvatarFallback className="bg-choresync-purple text-white text-xs">
            {message.sender.initials}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`max-w-[75%] rounded-2xl p-3 ${
          message.isCurrentUser
            ? "bg-choresync-blue text-white rounded-tr-none"
            : "bg-choresync-gray text-gray-800 rounded-tl-none"
        }`}
      >
        {!message.isCurrentUser && (
          <p className="text-xs font-medium mb-1">{message.sender.name}</p>
        )}
        <p className="text-sm">{message.text}</p>
        <p
          className={`text-xs mt-1 text-right ${
            message.isCurrentUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {message.timestamp}
        </p>
      </div>
      
      {message.isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
          <AvatarFallback className="bg-choresync-blue text-white text-xs">
            {message.sender.initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

const Chat = () => {
  const { user, currentFamily } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<FormattedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load messages when family changes
  useEffect(() => {
    if (!currentFamily || !user) return;
    
    // Get messages for current family
    const familyMessages = getMessagesByFamilyId(currentFamily.id);
    
    // Format messages for display
    const formattedMessages = familyMessages.map(msg => {
      const sender = currentFamily.members.find(m => m.userId === msg.senderId);
      
      return {
        id: msg.id,
        sender: {
          name: sender?.name || "Unknown",
          initials: sender?.initials || "??",
        },
        text: msg.text,
        timestamp: format(new Date(msg.timestamp), 'h:mm a'),
        isCurrentUser: msg.senderId === user.id,
      };
    });
    
    setMessages(formattedMessages);
  }, [currentFamily, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !user || !currentFamily) return;
    
    console.log("Sending message:", messageText);
    
    // Create new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      familyId: currentFamily.id,
      senderId: user.id,
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    
    // Save message to database
    saveMessage(newMessage);
    
    // Add message to state
    setMessages([
      ...messages,
      {
        id: newMessage.id,
        sender: {
          name: user.name,
          initials: user.initials,
        },
        text: newMessage.text,
        timestamp: format(new Date(newMessage.timestamp), 'h:mm a'),
        isCurrentUser: true,
      },
    ]);
    
    // Clear input
    setMessageText("");
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      <div className="p-4 bg-white shadow-sm z-10">
        <h1 className="text-2xl font-bold">
          {currentFamily ? `${currentFamily.name} Chat` : 'House Chat'}
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white border-t">
        <div className="flex items-center bg-choresync-gray rounded-full p-1">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-2"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <button
            className="bg-choresync-blue text-white rounded-full p-2 ml-1"
            onClick={handleSendMessage}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
