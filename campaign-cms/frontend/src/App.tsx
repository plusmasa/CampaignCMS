import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Dashboard } from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="app">
        <Dashboard />
      </div>
    </FluentProvider>
  );
}

export default App;
