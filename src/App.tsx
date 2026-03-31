/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { AuthProvider } from './AuthContext';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import Community from './pages/Community';
import Events from './pages/Events';
import Marketplace from './pages/Marketplace';
import Workshops from './pages/Workshops';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/events" element={<Events />} />
          <Route path="/community/marketplace" element={<Marketplace />} />
          <Route path="/community/workshops" element={<Workshops />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
