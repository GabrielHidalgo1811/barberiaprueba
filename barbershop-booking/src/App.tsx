import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/client/LandingPage';
import Login from './components/Login';
import AdminLayout from './components/admin/AdminLayout';
import ManageWorkers from './components/admin/ManageWorkers';
import ManageCatalog from './components/admin/ManageCatalog';
import AdminAnalytics from './components/admin/AdminAnalytics';
import WorkerSchedule from './components/WorkerSchedule';

function App() {
  return (
    <div className="min-h-screen bg-brand-light text-brand-dark font-inter selection:bg-brand-accent selection:text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dark Mode Admin Dashboard Nested Routing */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route path="workers" element={<ManageWorkers />} />
           <Route path="services" element={<ManageCatalog />} />
           <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        
        <Route path="/worker-schedule" element={<WorkerSchedule />} />
      </Routes>
    </div>
  );
}

export default App;
