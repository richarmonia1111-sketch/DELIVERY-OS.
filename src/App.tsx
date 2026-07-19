import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './lib/config';
import { StoreProvider } from './store';
import ToastContainer from './components/ToastContainer';
import LandingPage from './pages/LandingPage';
import HubPage from './pages/HubPage';
import CustomerPage from './pages/CustomerPage';
import OperatorPage from './pages/OperatorPage';
import DriverPage from './pages/DriverPage';
import AdminPage from './pages/AdminPage';
import BusinessesPage from './pages/BusinessesPage';
import ConfigPage from './pages/ConfigPage';
import TariffsPage from './pages/TariffsPage';
import SchedulePage from './pages/SchedulePage';

export default function App() {
  return (
    <ConfigProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/operador" element={<OperatorPage />} />
            <Route path="/driver" element={<DriverPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/businesses" element={<BusinessesPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/tariffs" element={<TariffsPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </StoreProvider>
    </ConfigProvider>
  );
}
