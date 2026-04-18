import { memo } from 'react';
import PropTypes from 'prop-types';
import assistentImage from "@/assets/asistente.webp";

const AssistantIcon = ({ onClick, className = "" }) => {
  return (
    <div className="relative group">
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Chat con IA
        <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
      </div>

      {/* Anillo de pulso exterior */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 opacity-30 animate-ping" />

      {/* Botón principal */}
      <button
        onClick={onClick}
        className={`relative h-14 w-14 rounded-full p-0.5 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 overflow-hidden ${className}`}
        aria-label="Abrir asistente virtual de IA"
      >
        <div className="h-full w-full rounded-full overflow-hidden bg-white">
          <img src={assistentImage} alt="Ambar, asistente de RVSolutions Plus" className="h-full w-full object-cover" />
        </div>
      </button>
    </div>
  );
};

AssistantIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

const MemoizedAssistantIcon = memo(AssistantIcon);
MemoizedAssistantIcon.displayName = 'AssistantIcon';

export default MemoizedAssistantIcon;
