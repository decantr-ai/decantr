import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FullBleed } from './shells/FullBleed';
import { TopNavMain } from './shells/TopNavMain';
import { TopNavFooter } from './shells/TopNavFooter';
import { HomePage } from './pages/HomePage';
import { DemoPage } from './pages/DemoPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* landing-hero zone — full-bleed shell */}
        <Route element={<FullBleed />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>

        {/* landing-resources zone — top-nav-main shell */}
        <Route element={<TopNavMain />}>
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Route>

        {/* landing-legal zone — top-nav-footer shell */}
        <Route element={<TopNavFooter />}>
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
