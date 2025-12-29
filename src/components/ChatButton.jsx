import styled from 'styled-components';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  /* position: absolute; */

  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: green;

  &:hover {
    cursor: pointer;
  }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  font-size: 2rem;
`;

function ChatButton({ onOpenForm }) {
  return (
    <StyledButton onClick={() => onOpenForm()}>
      <StyledFontAwesomeIcon icon={faCommentDots} />
    </StyledButton>
  );
}

export default ChatButton;
