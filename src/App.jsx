import { PatientProvider } from './context/PatientContext';
import PatientSidebar from './components/PatientSidebar';
import PatientView from './components/PatientView';
import PatientModal from './components/PatientModal';
import DataExport from './components/DataExport';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <PatientProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="main-container">
              <PatientSidebar />
              <main className="content-area">
                <PatientView />
              </main>
            </div>
          }>
          </Route>
          <Route path="/informdownload" element={<DataExport />} />
        </Routes>
        <PatientModal />
      </Router>
    </PatientProvider>
  );
}

export default App;