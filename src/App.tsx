import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/lib/cart';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import FixBotChat from '@/components/FixBotChat';
import Spinner from '@/components/Spinner';

// Code-splitting : chaque page est chargée à la demande (React.lazy).
// Seules les pages critiques restent dans le bundle initial.
const HomePage = lazy(() => import('@/pages/HomePage'));
const TutorialsPage = lazy(() => import('@/pages/TutorialsPage'));
const TutorialDetailPage = lazy(() => import('@/pages/TutorialDetailPage'));
const DevicesPage = lazy(() => import('@/pages/DevicesPage'));
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const StorePage = lazy(() => import('@/pages/StorePage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const JoinPage = lazy(() => import('@/pages/JoinPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const GuideCreationPage = lazy(() => import('@/pages/GuideCreationPage'));
const CreateTutorialPage = lazy(() => import('@/pages/CreateTutorialPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));

function PageFallback() {
  return <div className="pt-16 min-h-screen flex items-center justify-center"><Spinner label="Chargement..." /></div>;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tutoriels" element={<TutorialsPage />} />
            <Route path="/tutoriel/:slug" element={<TutorialDetailPage />} />
            <Route path="/appareils" element={<DevicesPage />} />
            <Route path="/communaute" element={<CommunityPage />} />
            <Route path="/boutique" element={<StorePage />} />
            <Route path="/boutique/:slug" element={<ProductDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/guide-creation" element={<GuideCreationPage />} />
            <Route path="/creer-tutoriel" element={<CreateTutorialPage />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/conditions" element={<LegalPage type="terms" />} />
            <Route path="/confidentialite" element={<LegalPage type="privacy" />} />
          </Routes>
        </Suspense>
        <Footer />
        <FixBotChat />
        <CookieConsent />
      </BrowserRouter>
    </CartProvider>
  );
}
