import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import { Meteors } from "@/components/meteors";

function App() {
  return (
    <div className="relative h-screen w-screen overflow-y-auto md:overflow-hidden bg-slate-200 dark:bg-zinc-950">
      <div className="absolute left-0 top-0 h-[500px] w-[500px] bg-gradient-to-br from-green-500/30 to-transparent rounded-full blur-md z-0 pointer-events-none"></div>
      <div className="absolute right-0 bottom-0 h-[500px] w-[500px] bg-gradient-to-tl from-green-500/30 to-transparent rounded-full blur-md z-0 pointer-events-none"></div>
      <div className="container mx-auto relative flex items-center justify-center h-auto md:h-full py-6">
        <div className="max-w-7xl w-full flex flex-col md:flex-row gap-6 md:h-full">
          <div className="w-full md:w-64 bg-white dark:bg-zinc-800 p-6 rounded-3xl md:rounded-l-3xl md:rounded-r-none shadow-xl md:h-full border-blur">
            <Sidebar />
          </div>
          <div className="flex-1 bg-white w-full dark:bg-zinc-800 rounded-3xl md:rounded-r-3xl md:rounded-l-none shadow-2xl flex flex-col md:h-full border-blur relative">
            <div className="flex-1 overflow-x-hidden md:overflow-y-auto p-4 z-10 relative scrollbar-green">
              <div className="w-full mx-auto">
                <Outlet />
              </div>
              <div className="hidden md:block">
                <Meteors number={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
