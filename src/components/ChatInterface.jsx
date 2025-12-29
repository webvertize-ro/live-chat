import styled from 'styled-components';
import edionTransLogo from '../assets/ediontrans_logo.svg';
import { useEffect, useState } from 'react';

const StyledChatInterface = styled.div`
  position: absolute;
  bottom: 10%;
  right: 100px;
  width: 400px;
  border-radius: 1rem;
  padding: 1rem;
  background-color: lightblue;
  color: #000;
`;

const Header = styled.div`
  display: flex;
  border-bottom: 1px solid black;
`;

const Messages = styled.div`
  display: flex;
  flex-direction: column;
`;

const Footer = styled.div`
  display: flex;
  border-top: 1px solid black;
  padding-top: 0.5rem;
`;

function ChatInterface({ userName, chatId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Fetch messages initially
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/getMessages?chat_id=${chatId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input) return;

    const res = await fetch('/api/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        message: input,
        chat_id: chatId,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setMessages((prev) => [...prev, { user_name: userName, message: input }]);
      setInput('');
    } else {
      console.error(data.error || 'Failed to send message');
    }
  };

  return (
    <StyledChatInterface>
      {/* Header */}
      <Header>
        <img src={edionTransLogo} width="30" />
        Welcome to the chat interface!
      </Header>
      {/* Container with messages */}
      <Messages>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.user_name}:</strong> {msg.message}
            <div>{msg.created_at}</div>
          </div>
        ))}
      </Messages>
      {/* Footer */}
      <Footer>
        <form onSubmit={sendMessage} className="d-flex">
          <input
            type="text"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Trimite
          </button>
        </form>
      </Footer>
    </StyledChatInterface>
  );
}

export default ChatInterface;
