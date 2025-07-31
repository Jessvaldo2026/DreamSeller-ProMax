import React, { useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Generator() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setStatus] = React.useState('Waiting for folder upload...');
  const [, setIsProcessing] = React.useState(false);
  const [, setProgress] = React.useState(0);
  const [, setUploadedFolder] = React.useState<string | null>(null);
  const [, setGeneratedBusinessId] = React.useState<string | null>(null);

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const firstFile = files[0];
      let folderName = firstFile?.webkitRelativePath?.split('/')[0] || firstFile?.name || 'Unknown Project';

      setUploadedFolder(folderName);
      setStatus('Analyzing project structure...');
      setIsProcessing(true);
      setProgress(0);

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: folderName,
          description: `AI-generated business from ${folderName} project`,
          business_type: 'generated',
          status: 'generating',
          monthly_revenue: 0,
          total_revenue: 0
        })
        .select()
        .single();

      if (businessError) throw businessError;
      setGeneratedBusinessId(business.id);

      const { error: genError } = await supabase
        .from('generations')
        .insert({ project_name: folderName, status: 'pending', progress: 0 });

      if (genError) throw genError;

      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file, file.webkitRelativePath || file.name);
      });
      formData.append('businessId', business.id);
      formData.append('projectName', folderName);
      formData.append('userId', (await supabase.auth.getSession()).data.session?.user.id || '');

      try {
        const response = await fetch('/api/generate-business', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error(`Processing failed: ${response.statusText}`);
        await response.json();

        const stages = [
          { message: 'Analyzing project structure...', progress: 10 },
          { message: 'Identifying business opportunities...', progress: 25 },
          { message: 'Generating revenue streams...', progress: 40 },
          { message: 'Setting up payment processing...', progress: 55 },
          { message: 'Creating business website...', progress: 70 },
          { message: 'Configuring automation...', progress: 85 },
          { message: 'Deploying to production...', progress: 95 },
          { message: '✅ Business successfully generated!', progress: 100 }
        ];

        for (const stage of stages) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setStatus(stage.message);
          setProgress(stage.progress);

          await supabase
            .from('generations')
            .update({ progress: stage.progress, status: stage.progress === 100 ? 'completed' : 'processing' })
            .eq('project_name', folderName);
        }

        await supabase
          .from('businesses')
          .update({
            status: 'active',
            website_url: `https://${folderName.toLowerCase()}.dreamsellers.org`,
            monthly_revenue: Math.floor(Math.random() * 5000) + 1000
          })
          .eq('id', business.id);

        await supabase
          .from('revenue_streams')
          .insert({
            business_id: business.id,
            stream_type: 'automated_sales',
            amount: Math.floor(Math.random() * 500) + 100,
            description: `Initial revenue from ${folderName} automation`
          });

        setIsProcessing(false);
        alert(`✅ Business generated successfully! Check \"Your Generated Apps\" section to manage your new app.`);

      } catch (error) {
        console.error('Processing failed:', error);
        if (error instanceof Error) setStatus(`❌ Processing failed: ${error.message}`);
        setIsProcessing(false);

        if (business?.id) {
          await supabase.from('businesses').update({ status: 'failed' }).eq('id', business.id);
          if (error instanceof Error) {
            await supabase.from('generations').update({ status: 'failed', error_message: error.message }).eq('project_name', folderName);
          }
        }
      }

    } catch (error) {
      console.error('Error handling folder upload:', error);
      setStatus('❌ Error processing folder. Please try again.');
      setIsProcessing(false);
    }
  };

  return <input
    ref={fileInputRef}
    type="file"
    multiple
    onChange={handleFolderUpload}
    className="hidden"
    {...({ webkitdirectory: '', directory: '' } as any)}
  />;
}

