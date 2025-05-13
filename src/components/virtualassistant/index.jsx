import useVirtualAssistant from '@/hooks/useVirtualAssistant';
import AssistantDialog from './AssistantDialog';
import AssistantIcon from './AssistantIcon';

const VirtualAssistantContainer = () => {
  const assistant = useVirtualAssistant();
  
  return (
    <>
      {/* Versión de escritorio - Icono flotante */}
      <div className="fixed bottom-16 right-6 z-50 hidden md:block">
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 justify-end mb-1">
            <span className="text-sm font-semibold text-green-500 dark:text-green-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm">
              Asistente Virtual
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 max-w-xs">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {assistant.developmentPhrases[assistant.currentPhrase]}
              </p>
            </div>
            
            <AssistantIcon onClick={() => assistant.setIsOpen(true)} />
          </div>
        </div>
      </div>
      
      {/* Versión móvil */}
      <div className="fixed bottom-16 right-6 z-50 flex flex-col items-center md:hidden">
        <div className="flex items-center gap-2 justify-center mb-1">
          <span className="text-sm font-semibold text-green-500 dark:text-green-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded-md shadow-sm">
            Asistente Virtual
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
        </div>
        
        <AssistantIcon onClick={() => assistant.setIsOpen(true)} />
      </div>

      {/* Diálogo del asistente */}
      <AssistantDialog 
        {...assistant}
      />
    </>
  );
};

export default VirtualAssistantContainer;
