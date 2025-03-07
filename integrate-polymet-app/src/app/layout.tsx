"use client"

import "./globals.css";

import React, { useState } from "react";
import Layout from "pages/layout";
import Dashboard from "pages/dashboard";
import ProjectMap from "pages/project-map";
import ProjectScoring from "pages/project-scoring";
import LlmAssistant from "pages/llm-assistant";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "project-map":
        return <ProjectMap />;
      case "project-scoring":
        return <ProjectScoring />;
      case "llm-assistant":
        return <LlmAssistant />;
      default:
        return <Dashboard />;
    }
  };

  return (
  <html lang="en">
    <body>
      <Layout
      setCurrentPage={setCurrentPage}
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
    </body>
  </html>
)
}
