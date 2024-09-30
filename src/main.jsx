import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import "@/i18next-config.js";
import { DarkModeProvider } from '@/context/darkmodecontext';

import App from "./App.jsx";
import ErrorPage from "@/pages/error-page";
import Projects from "@/pages/projects";
import ContactPage from "@/pages/contact";
import AboutMe from "@/pages/aboutme";
import Resume from "@/pages/resume";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/resume",
        element: <Resume />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/aboutme",
        element: <AboutMe />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DarkModeProvider>
    <I18nextProvider i18n={i18next}>
      <RouterProvider router={router} />
    </I18nextProvider>
    </DarkModeProvider>
  </StrictMode>
);
