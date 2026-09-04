import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import InputScreen    from './screens/InputScreen';
import ReviewScreen   from './screens/ReviewScreen';
import PublicSitePage from './screens/PublicSitePage';
import LoginScreen    from './screens/LoginScreen';

/**
 * Route map:
 *  /            → InputScreen    (mic + text input, language toggle)
 *  /login       → LoginScreen    (register / login)
 *  /review/:id  → ReviewScreen   (editable AI-generated fields + Publish)
 *  /site/:slug  → PublicSitePage (public, mobile-first business page)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"           element={<InputScreen />} />
          <Route path="/login"      element={<LoginScreen />} />
          <Route path="/review/:id" element={<ReviewScreen />} />
          <Route path="/site/:slug" element={<PublicSitePage />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
