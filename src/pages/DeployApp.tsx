import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';

interface BuildProject {
  id: string;
  name: string;
  platforms: string[];
  status: 'uploading' | 'analyzing' | 'building' | 'packaging' | 'completed' | 'failed';
  progress: number;
  downloadLinks: { [key: string]: string };
  previewUrl?: string;
  buildLogs: string[];
  fileCount: number;
  projectType: string;
}

export default function DeployApp() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setProjects] = useState<BuildProject[]>([]);
  const [selectedPlatforms] = useState<string[]>(['pwa']);
  const [isBuilding, setIsBuilding] = useState(false);

  const buildProject = async (projectId: string, files: File[]) => {
    console.log(`Building project ${projectId} with ${files.length} files`);
    // Mock build delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: 'completed',
              progress: 100,
              buildLogs: [...p.buildLogs, '✅ Build complete'],
              downloadLinks: { pwa: '/fake-download-link.zip' },
              projectType: 'Mock App'
            }
          : p
      )
    );
  };

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    try {
      const firstFile = files[0];
      let folderName = firstFile?.webkitRelativePath?.split('/')[0] || firstFile?.name || 'Unknown Project';

      const newProject: BuildProject = {
        id: Date.now().toString(),
        name: folderName,
        platforms: [...selectedPlatforms],
        status: 'uploading',
        progress: 0,
        downloadLinks: {},
        buildLogs: [],
        fileCount: files.length,
        projectType: 'unknown'
      };

      setProjects(prev => [newProject, ...prev]);
      setIsBuilding(true);
      await buildProject(newProject.id, Array.from(files));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error handling folder upload:', error);
        alert('Error processing folder upload. Please try again.');
      }
    } finally {
      setIsBuilding(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 text-white hover:bg-white/10 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">App Deployment Center</h1>
      </div>

      <div className="bg-white/10 p-6 rounded-xl">
        <h2 className="text-white text-xl font-bold mb-4">Upload Your Project</h2>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFolderUpload}
          className="hidden"
          {...({ webkitdirectory: '', directory: '' } as any)}
        />

        <button
          onClick={triggerFileUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={isBuilding}
        >
          <Upload className="inline-block w-4 h-4 mr-2" /> Choose Folder
        </button>
      </div>
    </div>
  );
}
