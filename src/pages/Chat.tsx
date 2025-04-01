
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface Message {
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

const ChatMessage = ({ message }: { message: Message }) => {
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
  const [messageText, setMessageText] = useState("");
  
  const messages: Message[] = [
    {
      id: "1",
      sender: {
        name: "Jack",
        initials: "JK",
      },
      text: "Hey everyone, I finished cleaning the living room!",
      timestamp: "10:30 AM",
      isCurrentUser: false,
    },
    {
      id: "2",
      sender: {
        name: "Sarah",
        initials: "SA",
      },
      text: "Great job! Don't forget we need to take out the trash tonight.",
      timestamp: "10:32 AM",
      isCurrentUser: false,
    },
    {
      id: "3",
      sender: {
        name: "Emma",
        initials: "EM",
      },
      text: "I'll take care of the trash. Can someone else help with dishes?",
      timestamp: "10:35 AM",
      isCurrentUser: true,
    },
    {
      id: "4",
      sender: {
        name: "Alex",
        initials: "AL",
      },
      text: "I can help with the dishes after work, around 6pm",
      timestamp: "10:40 AM",
      isCurrentUser: false,
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
      // In a real app, this would add the message to state and possibly send to a backend
    }
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      <div className="p-4 bg-white shadow-sm z-10">
        <h1 className="text-2xl font-bold">House Chat</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
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
