import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import { Meteors } from "@/components/meteors";

function App() {
  return (
    <div className="relative h-screen bg-slate-200 dark:bg-zinc-950 lg:overflow-hidden">
      <div className="absolute sm:left-12 left-0 top-[-15%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(24,155,73,.80),rgba(255,255,255,0))]"></div>
      <div className="sm:container sm:mx-auto relative flex items-center justify-center h-full py-6">
        <div className="w-screen flex flex-col md:flex-row gap-6 h-full">
          <div className="w-full md:w-64 bg-white dark:bg-zinc-800 p-6 rounded-3xl md:rounded-l-3xl md:rounded-r-none shadow-xl h-full border-blur">
            <Sidebar />
          </div>

          <div className="flex-1 bg-white w-full dark:bg-zinc-800 rounded-3xl md:rounded-r-3xl md:rounded-l-none shadow-2xl flex flex-col h-full border-blur relative">
            <div className="flex-1 overflow-x-hidden lg:w-full w-screen  p-4 z-10 relative scrollbar-green">
              <Outlet />
              <Meteors />
            </div>
            <div className="hidden sm:block absolute right-[-30%] bottom-[-15%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(24,155,73,.80),rgba(255,255,255,0))]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
