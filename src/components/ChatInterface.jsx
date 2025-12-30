import styled from 'styled-components';
import edionTransLogo from '../assets/ediontrans_logo.svg';
import { useEffect, useState } from 'react';
import { formatDate } from '../utils/formatDate';

const StyledChatInterface = styled.div`
  position: absolute;
  bottom: 10%;
  right: 100px;
  width: 400px;
  height: 500px;
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
  gap: 0.8rem;
  height: 400px;
  overflow-y: scroll;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background-color: lightgreen;
  border-radius: 1rem;
  padding: 0.5rem;
  align-self: ${(props) =>
    props.senderType === 'user' ? 'flex-end' : 'flex-start'};
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  font-size: 1.2rem;
`;

const MessageDate = styled.div`
  font-size: 0.7rem;
`;

const MessageName = styled.div``;

const Footer = styled.div`
  display: flex;
  border-top: 1px solid black;
  padding-top: 0.5rem;
`;

function ChatInterface({ userName, visitorId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Fetch messages initially

  useEffect(() => {
    const fetchMessages = async () => {
      if (!visitorId) return;

      const res = await fetch(`/api/getMessages?visitor_id=${visitorId}`);
      const data = await res.json();
      // fetched messages
      console.log('fetched messages: ', data);
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, [visitorId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input) return;

    const res = await fetch('/api/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        message: input,
        visitor_id: visitorId,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setInput('');
      // append new message
      setMessages((prev) => [...prev, data.message]);
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
          <MessageBubble key={i} senderType={msg.sender_type}>
            <strong>{msg.user_name}:</strong>
            <MessageContent>
              <Message>{msg.message}</Message>
              <MessageDate>{formatDate(msg.created_at)}</MessageDate>
            </MessageContent>
          </MessageBubble>
        ))}
        {/* <MessageBubble senderType="user">
          <MessageContent>
            <MessageName>
              <strong>Dane Hughes</strong>
            </MessageName>
            <Message>this is a test message</Message>
            <MessageDate>Dec 30, 2025, 02:44 PM</MessageDate>
          </MessageContent>
        </MessageBubble> */}
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
