import { StrictMode } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import i18next from "i18next";
import "@/i18next-config";
import { DarkModeProvider } from '@/context/darkmodecontext';

import App from "./App";
import ErrorPage from "@/pages/error-page";
import AboutMe from "@/pages/aboutme";

// aboutme queda en el bundle principal porque "/" redirige a ella; el resto se descarga al navegar
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    // Se muestra mientras se descarga la ruta inicial cuando es una página diferida (p. ej. al abrir /contact directo)
    HydrateFallback: () => (
      <div className="flex h-dvh w-full items-center justify-center bg-outer text-foreground">
        <p role="status" className="text-meta">
          {i18next.t("sidebar:loading")}
        </p>
      </div>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/aboutme" replace />,
      },
      {
        path: "/projects",
        lazy: lazyPage(() => import("@/pages/projects")),
      },
      {
        path: "/resume",
        lazy: lazyPage(() => import("@/pages/resume")),
      },
      {
        path: "/contact",
        lazy: lazyPage(() => import("@/pages/contact")),
      },
      {
        path: "/aboutme",
        element: <AboutMe />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("No se encontró el elemento #root");

createRoot(rootElement).render(
  <StrictMode>
    <DarkModeProvider>
      <I18nextProvider i18n={i18next}>
        <MotionConfig reducedMotion="user">
          <LazyMotion features={domAnimation} strict>
            <RouterProvider router={router} />
          </LazyMotion>
        </MotionConfig>
      </I18nextProvider>
    </DarkModeProvider>
  </StrictMode>
);
