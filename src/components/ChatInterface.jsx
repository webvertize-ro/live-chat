import styled from 'styled-components';
import edionTransLogo from '../assets/ediontrans_logo.svg';
import { useEffect, useRef, useState } from 'react';
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

const StyledInput = styled.input`
  font-size: 1.2rem;
`;

const StyledSendButton = styled.button`
  font-size: 1.2rem;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: ${(props) =>
    props.disabled ? 'rgba(227 116 52 0.2)' : 'rgba(227 116 52 1)'};
  color: #fff;
`;

const Spinner = styled.div`
  color: rgb(9, 78, 46);
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)``;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  background-color: rgba(148, 185, 54, 0.8);
  border-bottom: 2px solid #fff;
  color: black;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoImg = styled.img`
  width: 30px;
`;

const StyledH5 = styled.h5`
  margin: 0;
`;

const HeaderMessage = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledP = styled.p`
  margin: 0 !important;
`;

const PreviewP = styled.p`
  margin-bottom: 0.5rem;
  color: #fff;
  text-align: center;
`;

const PreviewContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const ImageAndName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
`;

const Messages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: 400px;
  overflow-y: scroll;
  background-color: rgba(9, 78, 46, 0.8);
  padding: 1rem;

  &::-webkit-scrollbar {
    width: 0.5rem;
  }

  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }

  &::-webkit-scrollbar-thumb {
    background-color: #519872;
    outline: 1px solid slategrey;
    border-radius: 0.5rem;
  }
`;

const PreviewContainer = styled.div`
  background-color: #75b06f;
  padding: 0.5rem;
`;

const StyledButton = styled.button`
  border: none;
  background-color: transparent;
  color: #fff;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #fff;
  color: #3b5249;
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
  align-items: center;
  justify-content: center;
  border-top: 2px solid #fff;
  padding: 0.5rem;
  background-color: rgba(81, 152, 114, 0.8);
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch messages initially
  useEffect(() => {
    const fetchMessages = async () => {
      if (!visitorId) return;

      const res = await fetch(`/api/getMessages?visitor_id=${visitorId}`);
      const data = await res.json();
      // fetched messages

      setMessages(data.messages || []);

      // Scroll immediately after initial load
      setTimeout(() => scrollToBottom('auto'), 0);
    };
    fetchMessages();
  }, [visitorId]);

  // Scroll when a new message arrives
  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom();
  }, [messages.length]);

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
          <LogoImg src={edionTransLogo} />
          <StyledH5>Asistență clienți</StyledH5>
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
        <div ref={messagesEndRef}></div>
      </Messages>

      {/* Small File Preview */}
      {attachment && (
        <PreviewContainer>
          <PreviewP>
            Previzualizare {previewUrl ? 'imagine' : 'document'}
          </PreviewP>
          <PreviewContent>
            {previewUrl ? (
              <ImageAndName>
                <img src={previewUrl} width="100" />
                <div>{attachment.name}</div>
              </ImageAndName>
            ) : (
              <div>{attachment.name}</div>
            )}
            <StyledButton type="button" onClick={clearAttachment}>
              <FontAwesomeIcon icon={faXmark} />
            </StyledButton>
          </PreviewContent>
        </PreviewContainer>
      )}

      {/* Footer */}
      <Footer>
        <SendMessageForm onSubmit={sendMessage} className="d-flex">
          <FileInput onSelectFile={handleSelectFile} />
          <StyledInput
            type="text"
            placeholder="Scrieți mesajul aici..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="form-control"
          />
          <StyledSendButton type="submit" disabled={!input ? true : false}>
            {loadingSendMessage ? (
              <Spinner
                className="spinner-border spinner-border-sm"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              <StyledFontAwesomeIcon icon={faPaperPlane} />
            )}
          </StyledSendButton>
        </SendMessageForm>
      </Footer>
    </StyledChatInterface>
  );
}

export default ChatInterface;
