/**
 * PortfolioComparePage.jsx
 * Displays up to 4 AI-generated mortgage portfolio scenarios for comparison.
 * Route: /wizard/compare (public, no auth required)
 *
 * User flow:
 *   1. User views portfolio cards
 *   2. User selects a portfolio (card highlights, floating bar appears)
 *   3. User clicks "Proceed" → SavePortfolioModal opens
 *   4. Modal handles auth check:
 *      - Authenticated: save via API → navigate to /paywall
 *      - Unauthenticated: navigate to /register with portfolio context
 */
import React, { useEffect, useState, useCallback } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import PortfolioCard from '../components/portfolio/PortfolioCard';
import CommunityTipBanner from '../components/portfolio/CommunityTipBanner';
import PortfolioSelector from '../components/portfolio/PortfolioSelector';
import PortfolioSkeleton from '../components/portfolio/PortfolioSkeleton';
import SavePortfolioModal from '../components/portfolio/SavePortfolioModal';

/**
 * Inner content component that consumes WizardContext.
 */
function PortfolioCompareContent() {
  const navigate = useNavigate();
  const {
    portfolios,
    communityTips,
    selectedPortfolioId,
    setSelectedPortfolioId,
  } = useWizard();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // If no portfolios in context, redirect back to wizard
  useEffect(() => {
    if (!portfolios || portfolios.length === 0) {
      // Small delay to allow context to hydrate from sessionStorage
      const timer = setTimeout(() => {
        if (!portfolios || portfolios.length === 0) {
          navigate('/wizard', { replace: true });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [portfolios, navigate]);

  const handleSelectPortfolio = useCallback(
    (portfolioId) => {
      setSelectedPortfolioId(portfolioId);
    },
    [setSelectedPortfolioId]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedPortfolioId(null);
  }, [setSelectedPortfolioId]);

  /**
   * Open the save/proceed modal when user clicks the floating CTA.
   */
  const handleProceed = useCallback(() => {
    if (selectedPortfolioId) {
      setIsModalOpen(true);
    }
  }, [selectedPortfolioId]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleBackToWizard = useCallback(() => {
    navigate('/wizard');
  }, [navigate]);

  // Show skeleton while portfolios are loading or context is hydrating
  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="min-h-screen bg-surface" dir="rtl">
        <CompareNavbar onBack={handleBackToWizard} />
        <CompareHeader />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <PortfolioSkeleton count={4} />
        </main>
        <CompareFooter />
      </div>
    );
  }

  const selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId) || null;

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      {/* Navbar */}
      <CompareNavbar onBack={handleBackToWizard} />

      {/* Hero Header Banner */}
      <CompareHeader portfolioCount={portfolios.length} />

      {/* Main Content */}
      <main
        className="max-w-6xl mx-auto px-4 py-8"
        id="main-content"
        aria-label="השוואת תיקי משכנתא"
      >
        {/* Community Tip Banner */}
        {communityTips && communityTips.length > 0 && (
          <div className="mb-6">
            <CommunityTipBanner tips={communityTips} />
          </div>
        )}

        {/* Selection instruction */}
        {!selectedPortfolioId && (
          <div
            className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-primary font-medium">
              בחר את התיק המתאים לך ביותר כדי להמשיך לניתוח מקצועי
            </p>
          </div>
        )}

        {/* Portfolio Grid */}
        <section aria-label="תיקי משכנתא">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            role="list"
            aria-label="רשימת תיקי משכנתא להשוואה"
          >
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} role="listitem">
                <PortfolioCard
                  portfolio={portfolio}
                  isSelected={selectedPortfolioId === portfolio.id}
                  onSelect={handleSelectPortfolio}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Bottom spacer for floating bar */}
        {selectedPortfolioId && <div className="h-28" aria-hidden="true" />}
      </main>

      {/* Floating Selection CTA */}
      <PortfolioSelector
        selectedPortfolio={selectedPortfolio}
        onProceed={handleProceed}
        onClearSelection={handleClearSelection}
      />

      {/* Save Portfolio Modal */}
      <SavePortfolioModal
        portfolio={selectedPortfolio}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Legal Disclaimer Footer */}
      <CompareFooter />
    </div>
  );
}

/** Navbar for the compare page */
function CompareNavbar({ onBack }) {
  return (
    <nav
      className="bg-white border-b border-border sticky top-0 z-40"
      role="navigation"
      aria-label="ניווט ראשי"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
            aria-label="Morty - דף הבית"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm" aria-hidden="true">M</span>
            </div>
            <span className="font-bold text-xl text-text1">Morty</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Back to wizard */}
            <button
              onClick={onBack}
              className="text-sm text-text2 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded px-2 py-1"
              aria-label="חזור לאשף"
            >
              ← חזור לאשף
            </button>
            {/* Login */}
            <Link to="/login"
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg
                hover:bg-primary hover:text-white transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              כניסה
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Hero header banner */
function CompareHeader({ portfolioCount }) {
  return (
    <header
      className="bg-gradient-to-br from-primary to-blue-600 text-white py-10 px-4"
      role="banner"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
          הנה {portfolioCount || 4} תיקי משכנתא מותאמים אישית עבורך
        </h1>
        <p className="text-base sm:text-lg text-white/80">
          מבוסס על נתוני בנק ישראל + AI
        </p>
        <p className="text-sm text-white/60 mt-2">
          בחר את התיק המתאים לך ביותר כדי להמשיך לניתוח מקצועי
        </p>
      </div>
    </header>
  );
}

/** Legal disclaimer footer */
function CompareFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs text-center py-4 px-6 mt-8">
      Morty הינו כלי תמיכה בהחלטות בלבד ואינו משמש כייעוץ פיננסי מורשה.
      כל המידע מוצג למטרות מידע בלבד. אין להסתמך עליו כתחליף לייעוץ מקצועי.
    </footer>
  );
}

export default function PortfolioComparePage() {
  return <PortfolioCompareContent />;
}