import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { businessModules } from '../lib/businessModules';

// Import all business module components
import DropshippingModule from '../components/BusinessModules/DropshippingModule';
import DigitalStoreModule from '../components/BusinessModules/DigitalStoreModule';
import AffiliateBlogModule from '../components/BusinessModules/AffiliateBlogModule';
import PrintOnDemandModule from '../components/BusinessModules/PrintOnDemandModule';
import FreelanceHubModule from '../components/BusinessModules/FreelanceHubModule';
import SaasToolModule from '../components/BusinessModules/SaasToolModule';
import AdRevenueModule from '../components/BusinessModules/AdRevenueModule';
import CoursePlatformModule from '../components/BusinessModules/CoursePlatformModule';
import InvestmentTrackerModule from '../components/BusinessModules/InvestmentTrackerModule';
import AppGeneratorModule from '../components/BusinessModules/AppGeneratorModule';

export default function BusinessModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const module = businessModules.find(m => m.id === moduleId);

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Module Not Found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderModuleComponent = () => {
    switch (moduleId) {
      case 'dropshipping': return <DropshippingModule />;
      case 'digital-store': return <DigitalStoreModule />;
      case 'affiliate-blog': return <AffiliateBlogModule />;
      case 'print-on-demand': return <PrintOnDemandModule />;
      case 'freelance-hub': return <FreelanceHubModule />;
      case 'saas-tool': return <SaasToolModule />;
      case 'ad-revenue': return <AdRevenueModule />;
      case 'course-platform': return <CoursePlatformModule />;
      case 'investment-tracker': return <InvestmentTrackerModule />;
      case 'app-generator': return <AppGeneratorModule />;
      default: return <div className="text-white">Module component not implemented</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{module.name}</h1>
              <p className="text-blue-200">{module.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderModuleComponent()}
      </div>
    </div>
  );
}