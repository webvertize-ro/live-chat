import styled from 'styled-components';

const Spinner = styled.div`
  color: ${(props) => (props.color ? props.color : '#000')};
`;

function LoadingComponent({ color }) {
  return (
    <Spinner className="spinner-border" role="status" color={color}>
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}

export default LoadingComponent;
