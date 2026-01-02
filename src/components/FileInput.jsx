import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const StyledLabel = styled.label``;
const StyledInput = styled.input`
  display: none;
`;

function FileInput({ onSelectFile }) {
  return (
    <>
      <StyledLabel htmlFor="upload-file">
        <FontAwesomeIcon icon={faPaperclip} />
      </StyledLabel>
      <StyledInput
        id="upload-file"
        type="file"
        onChange={(e) => onSelectFile(e.target.files[0])}
      />
    </>
  );
}

export default FileInput;
