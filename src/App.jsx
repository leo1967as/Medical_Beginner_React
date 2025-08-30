import { PatientProvider } from './context/PatientContext';
import { UserProvider } from './context/UserContext';
import PatientSidebar from './components/PatientSidebar';
import PatientView from './components/PatientView';
import PatientModal from './components/PatientModal';
import DataExport from './components/DataExport';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <UserProvider>
        <PatientProvider>
          <Routes>
            {/* Public route - Login page */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes - Require authentication */}
            <Route path="/" element={
              <AuthGuard>
                <div className="main-container">
                  <PatientSidebar />
                  <main className="content-area">
                    <PatientView />
                  </main>
                </div>
              </AuthGuard>
            }>
            </Route>
            
            {/* Protected route - Data export */}
            <Route path="/informdownload" element={
              <AuthGuard>
                <DataExport />
              </AuthGuard>
            } />
          </Routes>
          <PatientModal />
        </PatientProvider>
      </UserProvider>
    </Router>
  );
}

export default App;