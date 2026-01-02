import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import ChatInterface from './ChatInterface';
import edionLogo from '../assets/ediontrans_logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import LoadingComponent from './LoadingComponent';

const StyledChatForm = styled.form`
  position: absolute;
  bottom: 10%;
  right: 100px;
  width: 400px;
  border-radius: 1rem;
  padding: 1rem;
  background-color: #fff;
  border: 3px solid #1ca079;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
  color: #000;
`;

const Logo = styled.img`
  width: 50px;
`;

const LogoText = styled.div``;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const WelcomeMessage = styled.h3`
  display: flex;
  justify-content: center;
  text-align: center;
`;

const WelcomeInfo = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
  text-align: center;
  color: rgb(75 85 99);
`;

const StyledSpan = styled.span`
  font-family: 'EspumaPro-Bold';
  color: hsl(162, 70%, 37%);
  font-size: 2.2rem;
`;

const StyledSmall = styled.small`
  margin-top: -12px;
  text-transform: uppercase;
  font-size: 1rem;
`;

const StyledButton = styled.button`
  background-color: rgb(255, 107, 0);
  color: #fff;
  width: 100%;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
`;

function ChatForm() {
  const [visitor, setVisitor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // load visitor from localStorage
  useEffect(() => {
    const storedVisitorId = localStorage.getItem('visitorId');
    if (!storedVisitorId) {
      setIsLoading(false);
      return;
    }

    async function fetchVisitor() {
      try {
        const res = await fetch(`/api/visitors?visitorId=${storedVisitorId}`);
        const data = await res.json();
        setVisitor(data.visitor);
      } catch (error) {
        console.error(error);
        localStorage.removeItem('visitorId');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVisitor();
  }, []);

  async function onSubmit(formData) {
    try {
      const res = await fetch('/api/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      // Parse the JSON body
      const data = await res.json();
      console.log('API response: ', data);

      if (!res.ok) {
        throw new Error('Failed to submit the form!');
      }
      // register the visitorId in the localStorage
      localStorage.setItem('visitorId', data.visitor.id);

      // Mark the form as submitted
      setVisitor(data.visitor);

      reset();
    } catch (error) {
      console.error(error);
    }
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  return !visitor ? (
    <StyledChatForm onSubmit={handleSubmit(onSubmit)}>
      <LogoContainer className="mb-3">
        <Logo src={edionLogo} alt="" />
        <LogoText className="d-flex flex-column">
          <StyledSpan className="logo-text">Edion Trans</StyledSpan>
          <StyledSmall className="logo-subtext ms-1">
            Servicii de transport
          </StyledSmall>
        </LogoText>
      </LogoContainer>
      <WelcomeContainer>
        <WelcomeMessage>Bun venit!</WelcomeMessage>
        <WelcomeInfo>
          Introduceți numele și numărul de telefon pentru a începe o conversație
          în timp real.
        </WelcomeInfo>
      </WelcomeContainer>

      <div className="mb-4">
        <label htmlFor="name" className="form-label">
          Nume Complet
        </label>
        <input
          type="text"
          className="form-control p-2"
          placeholder="Introduceți numele complet"
          name="name"
          {...register('name', { required: 'Va rugam introduceti numele!' })}
        />
        {errors?.name && (
          <small className="text-danger">{errors.name?.message}</small>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="phoneNumber" className="form-label">
          Număr de telefon
        </label>
        <input
          type="text"
          className="form-control p-2"
          placeholder="Introduceți numărul de telefon"
          name="phoneNumber"
          {...register('phoneNumber', {
            required: 'Va rugam introduceti numarul de telefon!',
          })}
        />
        {errors?.phoneNumber && (
          <small className="text-danger">
            {errors['phoneNumber']?.message}
          </small>
        )}
      </div>
      <div className="mb-4">
        <StyledButton type="submit">Începe conversația</StyledButton>
      </div>
    </StyledChatForm>
  ) : (
    <ChatInterface userName={visitor.name} visitorId={visitor.id} />
  );
}

export default ChatForm;
