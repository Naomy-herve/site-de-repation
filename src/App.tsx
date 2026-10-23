import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/lib/cart';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import FixBotChat from '@/components/FixBotChat';
import HomePage from '@/pages/HomePage';
import TutorialsPage from '@/pages/TutorialsPage';
import TutorialDetailPage from '@/pages/TutorialDetailPage';
import DevicesPage from '@/pages/DevicesPage';
import CommunityPage from '@/pages/CommunityPage';
import StorePage from '@/pages/StorePage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import BlogPage from '@/pages/BlogPage';
import JoinPage from '@/pages/JoinPage';
import ProfilePage from '@/pages/ProfilePage';
import GuideCreationPage from '@/pages/GuideCreationPage';
import CreateTutorialPage from '@/pages/CreateTutorialPage';
import CartPage from '@/pages/CartPage';
import LegalPage from '@/pages/LegalPage';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
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
        <Footer />
        <FixBotChat />
        <CookieConsent />
      </BrowserRouter>
    </CartProvider>
  );
}
