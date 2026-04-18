import useVirtualAssistant from '@/hooks/useVirtualAssistant';
import AssistantDialog from './AssistantDialog';
import AssistantIcon from './AssistantIcon';

const VirtualAssistantContainer = () => {
  const assistant = useVirtualAssistant();

  return (
    <>
      {/* Versión de escritorio — icono flotante con burbuja */}
      <div className="fixed bottom-16 right-6 z-50 hidden md:block">
        <div className="flex flex-col items-end gap-2">
          {/* Burbuja de frase rotativa */}
          <div className="flex items-center gap-2 justify-end mb-1">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Asistente IA activo
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3">
            {/* Burbuja de texto */}
            <div className="relative bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg border border-slate-200 dark:border-slate-700 max-w-[220px] transition-all duration-500">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">
                {assistant.developmentPhrases[assistant.currentPhrase]}
              </p>
              {/* Cola de la burbuja */}
              <div className="absolute -right-2 bottom-0 w-0 h-0 border-l-8 border-l-white dark:border-l-slate-800 border-b-8 border-b-transparent" />
            </div>

            <AssistantIcon onClick={() => assistant.setIsOpen(true)} />
          </div>
        </div>
      </div>

      {/* Versión móvil — solo icono + indicador */}
      <div className="fixed bottom-16 right-6 z-50 flex flex-col items-center gap-1 md:hidden">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">IA</span>
        </div>
        <AssistantIcon onClick={() => assistant.setIsOpen(true)} />
      </div>

      {/* Diálogo del asistente */}
      <AssistantDialog {...assistant} />
    </>
  );
};

export default VirtualAssistantContainer;
