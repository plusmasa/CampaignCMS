import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CampaignEditor } from './pages/CampaignEditor';
import { NewCampaign } from './pages/NewCampaign';
import './App.css';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns/new" element={<NewCampaign />} />
            <Route path="/campaigns/:id" element={<CampaignEditor />} />
            <Route path="/campaigns/new/:id" element={<CampaignEditor isNewDraft />} />
          </Routes>
        </div>
      </BrowserRouter>
    </FluentProvider>
  );
}

export default App;
