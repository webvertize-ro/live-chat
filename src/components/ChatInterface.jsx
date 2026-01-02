import styled from 'styled-components';
import edionTransLogo from '../assets/ediontrans_logo.svg';
import { useEffect, useState } from 'react';
import { formatDate } from '../utils/formatDate';
import { supabase } from '../db/db';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons/faX';
import FileInput from './FileInput';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const StyledChatInterface = styled.div`
  position: absolute;
  bottom: 10%;
  right: 100px;
  width: 400px;
  border-radius: 1rem;
  background-color: lightblue;
  color: #000;
`;

const StyledInput = styled.input``;

const StyledSendButton = styled.button``;

const Header = styled.div`
  display: flex;
  border-bottom: 1px solid black;
  flex-direction: column;
`;

const HeaderTop = styled.div`
  display: flex;
  gap: 1rem;
`;

const HeaderMessage = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledP = styled.p`
  margin: 0;
`;

const Messages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: 400px;
  overflow-y: scroll;
`;

const PreviewContainer = styled.div`
  margin-bottom: 0.5rem;
  background: #fff;
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

const StyledButton = styled.button`
  margin-left: 0.5rem;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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

const SendMessageForm = styled.form`
  width: 100%;
  gap: 0.5rem;
  align-items: center;
`;

function ChatInterface({ userName, visitorId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);

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

  // Subscribe to real-time
  useEffect(() => {
    if (!visitorId) return;

    const channel = supabase
      .channel(`messages-${visitorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `visitor_id=eq.${visitorId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [visitorId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setLoadingSendMessage(true);

    if (!input && !attachment) return;

    let fileData = null;

    if (attachment) {
      const formData = new FormData();
      formData.append('file', attachment);
      formData.append('visitor_id', visitorId);

      const uploadRes = await fetch('/api/uploadAttachment', {
        method: 'POST',
        body: formData,
      });

      fileData = await uploadRes.json();
    }

    // Send message (text + optional file)
    await fetch('/api/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        message: input || null,
        sender_type: 'user',
        visitor_id: visitorId,
        type: attachment
          ? attachment.type.startsWith('image')
            ? 'image'
            : 'file'
          : 'text',
        file_url: fileData?.url,
        file_name: fileData?.name,
        file_mime: fileData?.mime,
      }),
    });

    // Reset UI
    setInput('');
    clearAttachment();
    setLoadingSendMessage(false);
  };

  const handleSelectFile = (file) => {
    if (!file) return;

    setAttachment(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setPreviewUrl(null);
  };

  return (
    <StyledChatInterface>
      {/* Header */}
      <Header>
        <HeaderTop>
          <img src={edionTransLogo} width="30" />
          <h5>Asistență clienți</h5>
        </HeaderTop>
        <HeaderMessage>
          <StyledP>Bun venit, {userName}!</StyledP>
        </HeaderMessage>
      </Header>
      {/* Container with messages */}
      <Messages>
        {messages.map((msg, i) => (
          <MessageBubble key={i} senderType={msg.sender_type}>
            <strong>{msg.user_name}:</strong>
            <MessageContent>
              {msg.type === 'text' && <Message>{msg.message}</Message>}
              {msg.type === 'image' && (
                <img src={msg.file_url} alt={msg.file_name} width="100" />
              )}
              {msg.type === 'file' && (
                <a href={msg.file_url} target="_blank">
                  {msg.file_name}
                </a>
              )}
              <MessageDate>{formatDate(msg.created_at)}</MessageDate>
            </MessageContent>
          </MessageBubble>
        ))}
      </Messages>

      {/* Small File Preview */}
      {attachment && (
        <PreviewContainer>
          {previewUrl ? (
            <img src={previewUrl} width="100" />
          ) : (
            <div>{attachment.name}</div>
          )}
          <StyledButton type="button" onClick={clearAttachment}>
            <FontAwesomeIcon icon={faXmark} />
          </StyledButton>
        </PreviewContainer>
      )}

      {/* Footer */}
      <Footer>
        <SendMessageForm onSubmit={sendMessage} className="d-flex">
          <FileInput onSelectFile={handleSelectFile} />
          <StyledInput
            type="text"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="form-control"
          />
          <StyledSendButton type="submit" className="btn btn-primary">
            {loadingSendMessage ? (
              <div
                className="spinner-border spinner-border-sm text-info"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </StyledSendButton>
        </SendMessageForm>
      </Footer>
    </StyledChatInterface>
  );
}

export default ChatInterface;
