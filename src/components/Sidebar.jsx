import {
  FiUser,
  FiFolder,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiTwitter,
} from "react-icons/fi";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import mainimage from "@/assets/fotoRV.png";
import { Darkmode } from "@/components/darkmode";
import { LanguageButton } from "@/components/languagebutton";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";


const roles = ["FullStack Developer", "IT Manager", "Senior System Engineer"];

const Sidebar = () => {
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prevRole) => (prevRole + 1) % roles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex justify-around mb-5">
          <Darkmode className="text-[7%]" />
          <LanguageButton />
        </div>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Avatar className="w-32 h-32">
            <AvatarImage src={mainimage} alt="Roberto J. Vargas" />
            <AvatarFallback>RVargas</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold">Roberto J. Vargas</h2>
          <motion.p
            className="text-lg font-semibold text-primary"
            key={currentRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {roles[currentRole]}
          </motion.p>
        </div>

        <Separator className="mb-4" />

        <nav className="flex-grow">
          <div className="flex flex-col space-y-1">
            <NavLink to="/aboutme" end>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <FiUser className="mr-2 h-4 w-4" />
                  About Me
                </Button>
              )}
            </NavLink>
            <NavLink to="/resume" end>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <IoCloudDownloadOutline className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              )}
            </NavLink>
            <NavLink to="/projects">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <FiFolder className="mr-2 h-4 w-4" />
                  Projects
                </Button>
              )}
            </NavLink>
            <NavLink to="/contact">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <FiMail className="mr-2 h-4 w-4" />
                  Contact Me
                </Button>
              )}
            </NavLink>
          </div>
        </nav>

        <Separator className="my-4" />
        <div className="flex flex-col items-center space-y-4 font-bold">
          <h3>rvargas@rv-solutions.net</h3>
        </div>

        <Separator className="my-4" />

        <footer className="mt-auto">
          <div className="flex justify-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiLinkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            © 2023 rvargas.dev All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
};

export default Sidebar;
