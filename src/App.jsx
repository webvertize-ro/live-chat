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
`;

const { data, error } = await supabase.from('visitors').select('*');

console.log('the retrieved data is: ', data);
console.log('the error is: ', error);

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleOpenForm() {
    setIsFormOpen(!isFormOpen);
  }

  return (
    <StyledChatContainer>
      {isFormOpen ? <ChatForm onLoading={setIsLoading} /> : ''}
      <ChatButton onOpenForm={handleOpenForm} isLoading={isLoading} />
    </StyledChatContainer>
  );
}

export default App;
