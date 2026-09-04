import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InputScreen    from './screens/InputScreen';
import ReviewScreen   from './screens/ReviewScreen';
import PublicSitePage from './screens/PublicSitePage';

/**
 * 3-screen routing structure:
 *  /            → InputScreen   (mic + text input, language toggle)
 *  /review/:id  → ReviewScreen  (editable AI-generated fields + Publish)
 *  /site/:slug  → PublicSitePage (public, mobile-first business page)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<InputScreen />} />
        <Route path="/review/:id" element={<ReviewScreen />} />
        <Route path="/site/:slug" element={<PublicSitePage />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
