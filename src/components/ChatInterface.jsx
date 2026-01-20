import styled from 'styled-components';
import edionTransLogo from '../assets/ediontrans_logo.svg';
import { useEffect, useRef, useState } from 'react';
import { formatDate } from '../utils/formatDate';
import { supabase } from '../db/db';
import {
  faVolumeHigh,
  faVolumeXmark,
  faWindowMinimize,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons/faX';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import FileInput from './FileInput';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import LoadingComponent from './LoadingComponent';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import useUserNotifications from '../hooks/useUserNotifications';
import { useUserSettings } from '../hooks/useUserSettings';

const StyledChatInterface = styled.div`
  position: absolute;
  bottom: 10%;
  right: 100px;
  width: 400px;
  border-radius: 1rem;
  background-color: lightblue;
  color: #000;

  @media (max-width: 576px) {
    bottom: 70px;
    right: 30px;
    width: 300px;
  }
`;

const StyledInput = styled.input`
  font-size: 1.2rem;
`;

const StyledSendButton = styled.button`
  font-size: 1.2rem;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  color: #fff;
  background-color: rgba(227, 116, 52, 1);
  &:disabled {
    background-color: rgba(227, 116, 52, 0.45);
    cursor: not-allowed;
    opacity: 0.9;
  }
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
  justify-content: space-between;

  @media (max-width: 576px) {
    justify-content: space-between;
  }
`;

const HeaderTopText = styled.div`
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

const MinimizeButton = styled.button`
  border: none;
  background-color: transparent;
  color: #1e5128;
`;

const HeaderMessage = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationLabel = styled.label``;

const NotificationButton = styled.button`
  border: none;
  background-color: transparent;
  color: #1ca079;
  font-size: 1.2rem;
`;

const StyledP = styled.p`
  margin: 0 !important;
`;

const PreviewP = styled.p`
  margin-bottom: 0.5rem;
  color: #2f3e3a;
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
  color: #2f3e3a;
`;

const Messages = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.loadingMessages ? 'center' : 'unset')};
  justify-content: ${(props) => (props.loadingMessages ? 'center' : 'unset')};
  gap: 0.8rem;
  height: 400px;
  overflow-y: scroll;
  overflow-x: hidden;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f7f9f5;
`;

const ReplyToPreviewContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  background-color: #75b06f;
  padding: 0.5rem;
`;

const ReplyAndMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ReplyFor = styled.div`
  color: #2f3e3a;
`;

const FileDetails = styled.div`
  color: #2f3e3a;
`;

const ReplyToImg = styled.img`
  width: 60px;
  border-radius: 0.5rem;
`;

const FilePreviewImg = styled.img`
  width: 60px;
  border-radius: 0.5rem;
`;

const StyledButton = styled.button`
  border: none;
  background-color: transparent;
  color: #2f3e3a;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #fff;
  color: ${(props) => (props.senderType === 'admin' ? '#fff' : '#3b5249')};
  border-radius: 1rem;
  padding: 0.5rem;
  align-self: ${(props) =>
    props.senderType === 'user' ? 'flex-end' : 'flex-start'};
  background-color: ${(props) =>
    props.senderType === 'admin' ? 'rgb(28, 160, 121)' : 'rgb(254, 252, 105)'};
  position: relative;

  &:hover .message-actions {
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledReplyButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(28, 160, 121);
  color: rgb(255, 255, 255);
  border-radius: 50%;
  top: -10px;
  left: -10px;
  position: absolute;
  border: none;
  font-size: 0.75rem;
  padding: 5px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
`;

const MessageBubbleStrong = styled.strong`
  display: flex;
  gap: 0.25rem;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatImg = styled.img`
  border-radius: 0.5rem;
  &:hover {
    cursor: pointer;
  }
`;

const StyledLink = styled.a`
  max-width: 325px;
  word-wrap: break-word;

  @media (max-width: 576px) {
    max-width: 250px;
  }
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

function ChatInterface({
  visitor,
  onOpenForm,
  onChatOpen,
  onAcknowledgeNotification,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { settings, loading, toggleNotificationSound } = useUserSettings();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;

    // default: sound OFF on first open
    setSoundEnabled(false);

    hydratedRef.current = true;
  }, []);

  const enabled = soundEnabled;

  useUserNotifications({
    visitorId: visitor?.id,
    soundEnabled,
  });

  const imageMessages = messages.filter(
    (msg) => (msg.file_url && msg.file_mime.startsWith('image/')) || [],
  );

  const slides = imageMessages.map((msg) => ({
    src: msg.file_url,
    alt: msg.file_name || 'Image',
  }));

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch messages initially
  useEffect(() => {
    const fetchMessages = async () => {
      if (!visitor.id) return;
      setLoadingMessages(true);

      const res = await fetch(`/api/getMessages?visitor_id=${visitor.id}`);
      const data = await res.json();
      // fetched messages

      setMessages(data.messages || []);

      setLoadingMessages(false);
      // Scroll immediately after initial load
      setTimeout(() => scrollToBottom('smooth'), 400);
    };
    fetchMessages();
  }, [visitor.id]);

  // Scroll when a new message arrives
  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom();
  }, [messages.length]);

  // Subscribe to real-time
  useEffect(() => {
    if (!visitor.id) return;

    const channel = supabase
      .channel(`messages-${visitor.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `visitor_id=eq.${visitor.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [visitor.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setLoadingSendMessage(true);

    if (!input && !attachment) return;

    let fileData = null;

    if (attachment) {
      const formData = new FormData();
      formData.append('file', attachment);
      formData.append('visitor_id', visitor.id);

      const uploadRes = await fetch('/api/uploadAttachment', {
        method: 'POST',
        body: formData,
      });

      fileData = await uploadRes.json();
    }

    // determine the type of message
    let messageType = 'text';

    if (attachment && input) {
      messageType = 'mixed';
    } else if (attachment) {
      messageType = attachment.type.startsWith('image') ? 'image' : 'file';
    }

    // Send message (text + optional file)
    await fetch('/api/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: visitor.name,
        message: input || null,
        sender_type: 'user',
        visitor_id: visitor.id,
        type: messageType,
        file_url: fileData?.url,
        file_name: fileData?.name,
        file_mime: fileData?.mime,
        reply_to_message_id: replyTo?.id ?? null,
      }),
    });

    // Reset UI
    setInput('');
    clearAttachment();
    setReplyTo(null);
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
          <HeaderTopText>
            <LogoImg src={edionTransLogo} />
            <StyledH5>Asistență clienți</StyledH5>
            <NotificationLabel>
              <NotificationButton
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  toggleNotificationSound(next);
                }}
              >
                {enabled ? (
                  <FontAwesomeIcon icon={faVolumeHigh} />
                ) : (
                  <FontAwesomeIcon icon={faVolumeXmark} />
                )}
              </NotificationButton>
            </NotificationLabel>
          </HeaderTopText>
          <MinimizeButton onClick={() => onChatOpen()}>
            <FontAwesomeIcon icon={faWindowMinimize} />
          </MinimizeButton>
        </HeaderTop>
        <HeaderMessage>
          <StyledP>Bun venit, {visitor.name}!</StyledP>
        </HeaderMessage>
      </Header>
      {/* Container with messages */}
      <Messages loadingMessages={loadingMessages}>
        {loadingMessages ? (
          <LoadingComponent color="#094e2e" />
        ) : (
          messages.map((msg, i) => {
            const repliedMessage = msg.reply_to_message_id
              ? messages.find((m) => m.id === msg.reply_to_message_id)
              : null;

            return (
              <MessageBubble key={msg.id} senderType={msg.sender_type}>
                <MessageBubbleStrong className="d-flex gap-1">
                  {msg.sender_type === 'admin' ? (
                    <img src={edionTransLogo} width="25" />
                  ) : null}
                  {msg.user_name}
                </MessageBubbleStrong>
                <MessageContent>
                  {/* replied message preview */}
                  {repliedMessage && (
                    <div
                      style={{
                        padding: '0.25rem 0.5rem',
                        marginBottom: '0.25rem',
                        borderLeft: '3px solid #ccc',
                        fontSize: '0.9rem',
                        opacity: 0.8,
                      }}
                    >
                      <strong>
                        {repliedMessage.sender_type === 'admin'
                          ? 'Edion Trans'
                          : `${msg.user_name}`}
                      </strong>
                      <div>{repliedMessage.message || 'Attachment'}</div>
                    </div>
                  )}

                  {msg.file_url && msg.file_mime?.startsWith('image/') ? (
                    <ChatImg
                      src={msg.file_url}
                      alt={msg.file_name}
                      width="100"
                      onClick={() => {
                        const index = imageMessages.findIndex(
                          (img) => img.file_url === msg.file_url,
                        );
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                    />
                  ) : msg.file_url ? (
                    <StyledLink
                      href={msg.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {msg.file_name}
                    </StyledLink>
                  ) : null}

                  {msg.message && <Message>{msg.message}</Message>}
                  <MessageDate>{formatDate(msg.created_at)}</MessageDate>
                </MessageContent>
                <StyledReplyButton
                  type="button"
                  className="message-actions"
                  onClick={() => {
                    setReplyTo({
                      id: msg.id,
                      file_url: msg.file_url,
                      file_name: msg.file_name,
                      file_mime: msg.file_mime,
                      user_name: msg.user_name,
                      message: msg.message,
                      sender_type: msg.sender_type,
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faReply} />
                </StyledReplyButton>
              </MessageBubble>
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </Messages>

      {/* reply-to preview above the input */}
      {replyTo && (
        <ReplyToPreviewContainer>
          <ReplyAndMessage>
            <ReplyFor>
              Răspuns pentru <strong>{replyTo.user_name}</strong>
            </ReplyFor>
            <FileDetails>
              {replyTo.file_url ? (
                replyTo.file_mime.startsWith('image/') ? (
                  <ReplyToImg src={replyTo.file_url} width="60" />
                ) : (
                  <a href={replyTo.file_url} target="_blank">
                    {replyTo.file_name}
                  </a>
                )
              ) : (
                <div>"{replyTo.message}"</div>
              )}
            </FileDetails>
          </ReplyAndMessage>

          <StyledButton type="button" onClick={() => setReplyTo(null)}>
            <FontAwesomeIcon icon={faXmark} />
          </StyledButton>
        </ReplyToPreviewContainer>
      )}

      {/* Small File Preview */}
      {attachment && (
        <PreviewContainer>
          <PreviewP>
            Previzualizare {previewUrl ? 'imagine' : 'document'}
          </PreviewP>
          <PreviewContent>
            {previewUrl ? (
              <ImageAndName>
                <FilePreviewImg src={previewUrl} width="100" />
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
            onClick={() => onAcknowledgeNotification(visitor)}
          />
          <StyledSendButton
            type="submit"
            disabled={(!input && !attachment) || loadingSendMessage}
          >
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

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />
    </StyledChatInterface>
  );
}

export default ChatInterface;
