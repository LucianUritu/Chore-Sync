import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMessagesByFamilyId, saveMessage, subscribeToMessages } from "@/services/messageService";
import { Message } from "@/services/types";
import { format } from "date-fns";
import { supabase } from "@/integration/supabase/clients";
import { useToast } from "@/hooks/use-toast";

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
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  console.log('🔵 Chat component rendered with:', { user: user?.id, family: currentFamily?.id });
  
  const formatMessage = (msg: Message): FormattedMessage => {
    const sender = currentFamily?.members.find(m => m.userId === msg.senderId);
    
    return {
      id: msg.id,
      sender: {
        name: sender?.name || "Unknown",
        initials: sender?.initials || "??",
      },
      text: msg.text,
      timestamp: format(new Date(msg.timestamp), 'h:mm a'),
      isCurrentUser: msg.senderId === user?.id,
    };
  };
  
  // Load messages when family changes
  useEffect(() => {
    if (!currentFamily || !user) {
      console.log('🔴 Cannot load messages - missing user or family');
      return;
    }
    
    const loadMessages = async () => {
      try {
        console.log('🔵 Loading messages for family:', currentFamily.name);
        
        // Get messages for current family
        const familyMessages = await getMessagesByFamilyId(currentFamily.id);
        
        console.log('🔵 Found messages:', familyMessages.length);
        
        // Format messages for display
        const formattedMessages = familyMessages.map(formatMessage);
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('🔴 Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };
    
    loadMessages();
  }, [currentFamily, user, toast]);
  
  // Set up real-time subscription
  useEffect(() => {
    if (!currentFamily || !user) return;
    
    console.log('🔵 Setting up real-time subscription for messages');
    
    const subscription = subscribeToMessages(currentFamily.id, (newMessage: Message) => {
      console.log('🟢 Received real-time message:', newMessage);
      
      const formattedMessage = formatMessage(newMessage);
      
      setMessages(prevMessages => {
        // Check if message already exists to avoid duplicates
        const exists = prevMessages.some(msg => msg.id === formattedMessage.id);
        if (exists) {
          console.log('🟡 Message already exists, skipping');
          return prevMessages;
        }
        
        console.log('🟢 Adding new message to chat');
        return [...prevMessages, formattedMessage];
      });
    });
    
    return () => {
      console.log('🔴 Cleaning up message subscription');
      supabase.removeChannel(subscription);
    };
  }, [currentFamily, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedText = messageText.trim();
    
    console.log('🔵 Attempting to send message:', { 
      text: trimmedText, 
      user: user?.id, 
      family: currentFamily?.id,
      isSending 
    });
    
    if (!trimmedText) {
      console.log('🟡 Message text is empty');
      return;
    }
    
    if (!user) {
      console.log('🔴 No user found');
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentFamily) {
      console.log('🔴 No family found');
      toast({
        title: "Error",
        description: "You must be part of a family to send messages",
        variant: "destructive",
      });
      return;
    }

    if (isSending) {
      console.log('🟡 Already sending a message');
      return;
    }
    
    setIsSending(true);
    
    try {
      console.log('🔵 Sending message to database');
      
      // Create new message (without id and timestamp since they're auto-generated)
      const newMessage = {
        familyId: currentFamily.id,
        senderId: user.id,
        text: trimmedText,
      };
      
      // Save message to database - real-time subscription will handle the UI update
      await saveMessage(newMessage);
      
      console.log('🟢 Message saved successfully');
      
      // Clear input
      setMessageText("");
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error('🔴 Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render if no user or family
  if (!user || !currentFamily) {
    return (
      <div className="flex flex-col h-screen pb-16 items-center justify-center">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pb-16">
      <div className="p-4 bg-white shadow-sm z-10">
        <h1 className="text-2xl font-bold">
          {currentFamily.name} Chat
        </h1>
        <p className="text-sm text-gray-500">
          {currentFamily.members.length} member{currentFamily.members.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet.<br />
              Be the first to say hello! 👋
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
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
            onKeyPress={handleKeyPress}
            disabled={isSending}
          />
          <button
            className={`text-white rounded-full p-2 ml-1 transition-colors ${
              isSending || !messageText.trim()
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-choresync-blue hover:bg-choresync-blue/90"
            }`}
            onClick={handleSendMessage}
            disabled={isSending || !messageText.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
