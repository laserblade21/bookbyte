
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar,
  CircularProgress,
  Fab,
  Collapse,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Send as SendIcon, 
  Chat as ChatIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { sendMessageToAI, ChatMessage } from '../../services/aiService';

const ChatBot: React.FC = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm ByteBooks AI. How can I help you discover your next great read today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Filter out system messages before sending to API
      const chatHistory = messages.filter(msg => msg.role !== 'system');
      
      // Get AI response
      const aiResponse = await sendMessageToAI(input, chatHistory);
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: aiResponse 
        }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      {/* Chat Window */}
      <Collapse in={isOpen} timeout="auto">
        <Paper 
          elevation={3} 
          sx={{ 
            width: { xs: 320, sm: 400 }, 
            height: 500, 
            mb: 2, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          {/* Chat Header */}
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BotIcon sx={{ mr: 1 }} />
              <Typography variant="h6">ByteBooks AI</Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider />
          
          {/* Messages Container */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              p: 2, 
              overflowY: 'auto',
              bgcolor: '#f5f5f5'
            }}
          >
            {messages.map((message, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                {message.role === 'assistant' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      mr: 1,
                      width: 32,
                      height: 32
                    }}
                  >
                    <BotIcon fontSize="small" />
                  </Avatar>
                )}
                
                <Paper 
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderTopRightRadius: message.role === 'user' ? 0 : 2,
                    borderTopLeftRadius: message.role === 'assistant' ? 0 : 2,
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Paper>
                
                {message.role === 'user' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: 'secondary.main', 
                      ml: 1,
                      width: 32,
                      height: 32
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>
            ))}
            
            {isLoading && (
              <Box 
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mb: 2
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 1,
                    width: 32,
                    height: 32
                  }}
                >
                  <BotIcon fontSize="small" />
                </Avatar>
                
                <Paper 
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    borderTopLeftRadius: 0,
                    minWidth: 60,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <CircularProgress size={20} thickness={6} />
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input Area */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'background.paper',
              borderTop: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask about books, authors, or recommendations..."
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                sx={{ ml: 1 }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>
      
      {/* Chat Button */}
      <Fab
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="chat"
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Box>
  );
};

export default ChatBot;