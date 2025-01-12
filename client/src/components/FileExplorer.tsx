import React from 'react';
import { File, Folder, Code, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { File as FileType } from '../types';

interface FileExplorerProps {
  files: FileType[];
}

const FileExplorerItem: React.FC<{ file: FileType; depth?: number; onFileClick: (file: FileType) => void }> = ({ 
  file, 
  depth = 0,
  onFileClick 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={() => {
          if (file.type === 'folder') {
            setIsOpen(!isOpen);
          } else {
            onFileClick(file);
          }
        }}
      >
        {file.type === 'folder' ? (
          <Folder className="w-4 h-4 text-blue-400" />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-sm text-gray-200">{file.name}</span>
      </div>
      {file.type === 'folder' && isOpen && file.children?.map((child, index) => (
        <FileExplorerItem key={index} file={child} depth={depth + 1} onFileClick={onFileClick} />
      ))}
    </div>
  );
};

const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

type Tab = 'code' | 'preview';

const FileExplorer: React.FC<FileExplorerProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = React.useState<FileType | null>(null);
  const [activeTab, setActiveTab] = React.useState<Tab>('code');
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  const handleFileClick = (file: FileType) => {
    setSelectedFile(file);
  };

  React.useEffect(() => {
    // In a real app, this would be your actual preview URL
    setPreviewUrl('http://localhost:5173');
  }, []);

  const TabButton: React.FC<{ tab: Tab; icon: React.ReactNode; label: string }> = ({ 
    tab, 
    icon, 
    label 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200">File Explorer</h2>
      </div>
      <div className="grid grid-cols-2 flex-1 divide-x divide-gray-700">
        <div className="p-2 overflow-y-auto">
          {files.map((file, index) => (
            <FileExplorerItem key={index} file={file} onFileClick={handleFileClick} />
          ))}
        </div>
        <div className="overflow-hidden flex flex-col">
          <div className="border-b border-gray-700 flex">
            <TabButton 
              tab="code" 
              icon={<Code className="w-4 h-4" />} 
              label="Code" 
            />
            <TabButton 
              tab="preview" 
              icon={<Eye className="w-4 h-4" />} 
              label="Preview" 
            />
          </div>
          {activeTab === 'code' ? (
            selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="p-2 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-gray-200">{selectedFile.name}</h3>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={getLanguageFromFileName(selectedFile.name)}
                    value={selectedFile.content || ''}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Select a file to view its contents
              </div>
            )
          ) : (
            <div className="h-full">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Website Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;