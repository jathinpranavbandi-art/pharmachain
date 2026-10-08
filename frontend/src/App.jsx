import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './api.js';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Medicines from './pages/Medicines.jsx';
import Register from './pages/Register.jsx';
import QrGenerator from './pages/QrGenerator.jsx';
import Verification from './pages/Verification.jsx';
import SupplyChain from './pages/SupplyChain.jsx';
import BlockchainHistory from './pages/BlockchainHistory.jsx';
import Profile from './pages/Profile.jsx';
import PublicVerify from './pages/PublicVerify.jsx';

const Protected = ({ children }) => (auth.token() ? children : <Navigate to="/login" replace />);

export default function App() {
  return (
    <Routes>
      <Route path="/verify/:batchId" element={<PublicVerify />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/register" element={<Register />} />
        <Route path="/qr" element={<QrGenerator />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/supply-chain" element={<SupplyChain />} />
        <Route path="/history" element={<BlockchainHistory />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
