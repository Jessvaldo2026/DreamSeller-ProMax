import React, { useState, useRef } from 'react';
import { Code, Upload, Zap, CheckCircle, AlertCircle, Rocket, Github, Globe } from 'lucide-react';

interface GenerationProject {
  id: string;
  name: string;
  status: 'uploading' | 'analyzing' | 'fixing' | 'optimizing' | 'deploying' | 'completed' | 'failed';
  progress: number;
  issues: string[];
  fixes: string[];
  deployUrl?: string;
  githubUrl?: string;
}

export default function AppGeneratorModule() {
  const [projects, setProjects] = useState<GenerationProject[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }
    
    try {
      const firstFile = files[0];
      if (!firstFile) {
        console.log("First file is undefined");
        return;
      }
      
      let folderName = 'Unknown Project';
      
      // Safe path extraction
      if (typeof firstFile.webkitRelativePath === "string" && firstFile.webkitRelativePath) {
        const pathMatch = firstFile.webkitRelativePath.match(/^([^\/]+)/);
        if (pathMatch && pathMatch[1]) {
          folderName = pathMatch[1];
        }
      } else if (typeof firstFile.name === "string" && firstFile.name) {
        folderName = firstFile.name;
      } else {
        console.log("No valid file name available");
        folderName = 'Unknown Project';
      }
      
      const newProject: GenerationProject = {
        id: Date.now().toString(),
        name: folderName,
        status: 'uploading',
        progress: 0,
        issues: [],
        fixes: []
      };

      setProjects(prev => [newProject, ...prev]);
      setIsProcessing(true);

      // Simulate the AI processing pipeline
      processProject(newProject.id);
      
    } catch (error) {
      console.error('Error handling folder upload:', error);
      alert('Error processing folder upload. Please try again.');
    }
  };

  const processProject = async (projectId: string) => {
    const stages = [
      { status: 'analyzing', progress: 20, duration: 2000, issues: ['Missing dependencies', 'Outdated packages', 'Security vulnerabilities'] },
      { status: 'fixing', progress: 40, duration: 3000, fixes: ['Updated package.json', 'Fixed security issues', 'Added error handling'] },
      { status: 'optimizing', progress: 60, duration: 2500, fixes: ['Optimized bundle size', 'Added caching', 'Improved performance'] },
      { status: 'deploying', progress: 80, duration: 3000, fixes: ['Built production version', 'Deployed to cloud', 'Configured CDN'] },
      { status: 'completed', progress: 100, duration: 1000, deployUrl: 'https://your-app.vercel.app', githubUrl: 'https://github.com/user/generated-app' }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              status: stage.status as any,
              progress: stage.progress,
              issues: stage.issues || project.issues,
              fixes: [...project.fixes, ...(stage.fixes || [])],
              deployUrl: stage.deployUrl || project.deployUrl,
              githubUrl: stage.githubUrl || project.githubUrl
            }
          : project
      ));
    }

    setIsProcessing(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">App Generator AI</h2>
          <p className="text-blue-200">Upload folders to automatically fix, optimize, and deploy apps</p>
        </div>
        <button 
          onClick={triggerFileUpload}
          disabled={isProcessing}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Project</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderUpload}
        className="hidden"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Projects</p>
              <p className="text-xl font-bold text-white">{projects.length}</p>
            </div>
            <Code className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Completed</p>
              <p className="text-xl font-bold text-white">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Processing</p>
              <p className="text-xl font-bold text-white">
                {projects.filter(p => !['completed', 'failed'].includes(p.status)).length}
              </p>
            </div>
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Success Rate</p>
              <p className="text-xl font-bold text-white">
                {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0}%
              </p>
            </div>
            <Rocket className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Projects List */}
      {projects.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Project Queue</h3>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(project.status)}
                    <div>
                      <h4 className="text-white font-semibold">{project.name}</h4>
                      <p className={`text-sm capitalize ${getStatusColor(project.status)}`}>
                        {project.status.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{project.progress}%</p>
                    {project.status === 'completed' && (
                      <div className="flex space-x-2 mt-2">
                        {project.deployUrl && (
                          <a
                            href={project.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Live</span>
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center space-x-1"
                          >
                            <Github className="w-3 h-3" />
                            <span>Code</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                {project.issues.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-red-400 text-sm font-medium mb-1">Issues Found:</h5>
                    <div className="flex flex-wrap gap-1">
                      {project.issues.map((issue, index) => (
                        <span
                          key={index}
                          className="text-xs bg-red-600/20 text-red-300 px-2 py-1 rounded"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {project.fixes.length > 0 && (
                  <div>
                    <h5 className="text-green-400 text-sm font-medium mb-1">AI Fixes Applied:</h5>
                    <div className="flex flex-wrap gap-1">
                      {project.fixes.map((fix, index) => (
                        <span
                          key={index}
                          className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded"
                        >
                          {fix}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Capabilities */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">AI Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Code Analysis & Fixing</h4>
            <p className="text-sm text-blue-200">Automatically detects and fixes bugs, security vulnerabilities, and performance issues</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Dependency Management</h4>
            <p className="text-sm text-blue-200">Updates outdated packages, resolves conflicts, and optimizes bundle size</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Performance Optimization</h4>
            <p className="text-sm text-blue-200">Implements caching, lazy loading, and other performance best practices</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Automated Deployment</h4>
            <p className="text-sm text-blue-200">Builds and deploys to cloud platforms with CI/CD pipeline setup</p>
          </div>
        </div>
      </div>

      {/* Upload Instructions */}
      {projects.length === 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-center">
          <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Upload Your Project</h3>
          <p className="text-blue-200 mb-4">
            Select any project folder and our AI will automatically analyze, fix, and deploy your application
          </p>
          <button 
            onClick={triggerFileUpload}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Choose Project Folder
          </button>
        </div>
      )}
    </div>
  );
}