import '../App.css';
import styled from 'styled-components';
import ChatButton from './components/ChatButton';
import ChatForm from './components/ChatForm';
import { useState } from 'react';
import { supabase } from './db/db';

const StyledChatContainer = styled.div`
  position: absolute;
  right: 2rem;
  bottom: 5%;

  @media (max-width: 576px) {
    right: 1rem;
    bottom: 1rem;
  }
`;

const { data, error } = await supabase.from('visitors').select('*');

console.log('the retrieved data is: ', data);
console.log('the error is: ', error);

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  function handleOpenForm() {
    setIsFormOpen(!isFormOpen);
  }

  return (
    <StyledChatContainer>
      {isFormOpen ? <ChatForm onOpenForm={handleOpenForm} /> : ''}
      <ChatButton onOpenForm={handleOpenForm} />
    </StyledChatContainer>
  );
}

export default App;
