import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import StepsList from '../components/StepsList';
import FileExplorer from '../components/FileExplorer';
import type { Step, FileItem } from '../types';

const Builder: React.FC = () => {
  const location = useLocation();
  const prompt = location.state?.prompt;

  if (!prompt) {
    return <Navigate to="/" replace />;
  }

  const steps: Step[] = [
    {
      id: 1,
      title: 'Analyzing Requirements',
      description: 'Processing your request and determining the necessary components.',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Setting Up Project Structure',
      description: 'Creating the basic file structure and configuration.',
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Installing Dependencies',
      description: 'Installing required packages and libraries.',
      status: 'pending'
    }
  ];

  const files: FileItem[] = [
    {
      name: 'src',
      type: 'folder',
      children: [
        { 
          name: 'components', 
          type: 'folder', 
          children: [
            { 
              name: 'Header.tsx', 
              type: 'file',
              content: 'import React from "react";\n\nconst Header = () => {\n  return (\n    <header>\n      <h1>My Website</h1>\n    </header>\n  );\n};\n\nexport default Header;'
            },
            { 
              name: 'Footer.tsx', 
              type: 'file',
              content: 'import React from "react";\n\nconst Footer = () => {\n  return (\n    <footer>\n      <p>&copy; 2024 My Website</p>\n    </footer>\n  );\n};\n\nexport default Footer;'
            }
          ]
        },
        { 
          name: 'App.tsx', 
          type: 'file',
          content: 'import React from "react";\nimport Header from "./components/Header";\nimport Footer from "./components/Footer";\n\nfunction App() {\n  return (\n    <div>\n      <Header />\n      <main>Content goes here</main>\n      <Footer />\n    </div>\n  );\n}\n\nexport default App;'
        },
        { 
          name: 'main.tsx', 
          type: 'file',
          content: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);'
        }
      ]
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        { 
          name: 'index.html', 
          type: 'file',
          content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>My Website</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-200">Building Your Website</h1>
          <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StepsList steps={steps} />
          <FileExplorer files={files} />
        </div>
      </main>
    </div>
  );
};

export default Builder;