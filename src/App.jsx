import Sidebar from "./components/Sidebar";
import Whatsapp from "@/components/whatsapp";
import { Outlet } from "react-router-dom";
import { Meteors } from "@/components/meteors";

function App() {
  return (
    <div className="relative h-screen w-screen bg-slate-200 dark:bg-zinc-950 lg:overflow-hidden">
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-15%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(24,155,73,.80),rgba(255,255,255,0))]"></div>
      <div className="absolute  right-[-20%] bottom-[-15%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(24,155,73,.80),rgba(255,255,255,0))]"></div>
      <div className="relative flex items-center justify-center h-full py-6">
        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-6 h-full">
          <div className="w-full md:w-64 bg-white dark:bg-zinc-800 p-6 rounded-l-3xl shadow-xl h-full border-blur">
            <Sidebar />
          </div>

          <div className="flex-1 bg-white dark:bg-zinc-800 rounded-r-3xl shadow-2xl flex flex-col h-full border-blur relative">
            <div className="flex-1 overflow-y-auto p-4 z-10 relative scrollbar-green">
              <Outlet />
            <Meteors />
            </div>
          </div>
        </div>
        <Whatsapp />
      </div>
    </div>
  );
}

export default App;
