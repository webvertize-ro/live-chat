import { useForm } from 'react-hook-form';
import styled from 'styled-components';

const StyledChatForm = styled.form`
  position: absolute;
  bottom: 10%;
  right: 100px;
  width: 400px;
  border-radius: 1rem;
  padding: 1rem;
  background-color: lightblue;
  color: #000;
`;

function ChatForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

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

      console.log('this is data.success', data.success);
      console.log('this is data.message', data.message);

      if (!res.ok) {
        throw new Error('Failed to submit the form!');
      }

      reset();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <StyledChatForm onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="name" className="form-label">
          Name
        </label>
        <input
          type="text"
          className="form-control"
          name="name"
          {...register('name', { required: 'Please fill in the name!' })}
        />
        {errors?.name && (
          <small className="text-danger">{errors.name?.message}</small>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="phoneNumber" className="form-label">
          Phone Number
        </label>
        <input
          type="text"
          className="form-control"
          name="phoneNumber"
          {...register('phoneNumber', {
            required: 'Please fill in the phone number!',
          })}
        />
        {errors?.name && (
          <small className="text-danger">
            {errors['phone-number']?.message}
          </small>
        )}
      </div>
      <div className="mb-4">
        <button type="submit" className="btn btn-primary">
          Start conversation
        </button>
      </div>
    </StyledChatForm>
  );
}

export default ChatForm;
