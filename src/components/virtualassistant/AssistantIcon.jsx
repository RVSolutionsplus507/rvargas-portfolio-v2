import { memo } from 'react';
import PropTypes from 'prop-types';
import assistentImage from "@/assets/asistente.webp";

const AssistantIcon = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 w-12 rounded-full bg-white shadow-lg transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 overflow-hidden ${className}`}
      aria-label="Abrir asistente virtual"
    >
      <img src={assistentImage} alt="Asistente Virtual" className="h-full w-full object-cover" />
    </button>
  );
};


AssistantIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};


const MemoizedAssistantIcon = memo(AssistantIcon);
MemoizedAssistantIcon.displayName = 'AssistantIcon';

export default MemoizedAssistantIcon;
