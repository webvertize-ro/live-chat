import styled from 'styled-components';
import { faComments } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import LoadingComponent from './LoadingComponent';

const ChatButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChatMessage = styled.div`
  background-color: #b1df37;
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  /* position: absolute; */

  border: none;
  padding: 1rem;
  border-radius: 50%;
  background-color: #1ca079;

  &:hover {
    cursor: pointer;
  }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  font-size: 2rem;
  color: #fff;
`;

function ChatButton({ onOpenForm }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  function handleChatOpen() {
    setIsChatOpen((prev) => !prev);
    onOpenForm();
  }

  return (
    <ChatButtonContainer>
      {isChatOpen ? (
        ''
      ) : (
        <ChatMessage>Discută cu un reprezentant Edion Trans!</ChatMessage>
      )}

      <StyledButton onClick={() => handleChatOpen()}>
        <StyledFontAwesomeIcon icon={faComments} />
      </StyledButton>
    </ChatButtonContainer>
  );
}

export default ChatButton;
