import AdminUsersView from './components/AdminUsersView';
import AppFooter from './components/AppFooter';
import AppNavigation from './components/AppNavigation';
import CelestialBackground from './components/CelestialBackground';
import ChartSection from './components/ChartSection';
import CompatibilityView from './components/CompatibilityView';
import FeatureCards from './components/FeatureCards';
import GeneralInfoModal from './components/GeneralInfoModal';
import Hero from './components/Hero';
import HoroscopeDisplay from './components/HoroscopeDisplay';
import MainTabs from './components/MainTabs';
import MobileTabBar from './components/MobileTabBar';
import NumerologyView from './components/NumerologyView';
import OnboardingModal from './components/OnboardingModal';
import QuotaError from './components/QuotaError';
import SettingsModal from './components/SettingsModal';
import ShopView from './components/ShopView';
import SubscriptionModal from './components/SubscriptionModal';
import TarotView from './components/TarotView';
import ZodiacSignGrid from './components/ZodiacSignGrid';
import { useAstraApp } from './hooks/useAstraApp';

export default function App() {
  const { state, actions } = useAstraApp();

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-24 font-sans text-slate-200 lg:pb-0">
      <CelestialBackground aria-hidden="true" />
      <AppNavigation
        activeTab={state.activeTab}
        isPremium={state.isPremium}
        userProfile={state.userProfile}
        onSetTab={actions.setActiveTab}
        onOpenSettings={() => actions.setIsSettingsOpen(true)}
        onOpenSubscription={() => actions.setSubModalOpen(true)}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <QuotaError error={state.error} onRetry={actions.retryAstroRequests} />
        {state.activeTab !== 'admin' && <Hero />}
        <MainTabs activeTab={state.activeTab} onChange={actions.setActiveTab} />

        <section className="min-h-[500px]">
          {state.activeTab === 'horoscope' && (
            <div className="space-y-12">
              <div className="text-center">
                <h3 className="mb-8 text-xs uppercase tracking-[0.5em] text-slate-500">Ивээл ордоо сонгоно уу</h3>
                <ZodiacSignGrid onSelect={actions.setSelectedSign} selectedSign={state.selectedSign} />
              </div>
              <HoroscopeDisplay data={state.horoscope} isLoading={state.loading} isPersonalized={!!state.chartInterpretation} />
            </div>
          )}

          {state.activeTab === 'chart' && (
            <ChartSection
              chartInterpretation={state.chartInterpretation}
              isPremium={state.isPremium}
              loading={state.loading}
              userProfile={state.userProfile}
              onClearProfile={actions.clearProfile}
              onOpenSubscription={() => actions.setSubModalOpen(true)}
              onSaveProfile={actions.saveProfile}
            />
          )}

          {state.activeTab === 'compatibility' && <CompatibilityView />}
          {state.activeTab === 'tarot' && <TarotView />}
          {state.activeTab === 'shop' && <ShopView onPurchase={actions.handlePurchase} isLoading={state.purchaseLoading} />}
          {state.activeTab === 'numerology' && <NumerologyView userProfile={state.userProfile} />}
          {state.activeTab === 'admin' && (
            <AdminUsersView
              activeProfile={state.userProfile}
              users={state.users}
              onAddUser={actions.addUser}
              onDeleteUser={actions.deleteUser}
              onSelectUser={actions.selectUser}
            />
          )}
        </section>

        {state.activeTab !== 'admin' && <FeatureCards onOpenInfo={actions.setInfoModal} />}
      </main>

      <div className="hidden lg:block">
        <AppFooter onOpenInfo={actions.setInfoModal} onSetTab={actions.setActiveTab} />
      </div>
      <MobileTabBar activeTab={state.activeTab} onChange={actions.setActiveTab} />

      <SubscriptionModal isOpen={state.isSubModalOpen} onClose={() => actions.setSubModalOpen(false)} onUpgrade={actions.upgradeToPremium} />
      <GeneralInfoModal
        isOpen={state.infoModal.isOpen}
        onClose={() => actions.setInfoModal({ ...state.infoModal, isOpen: false })}
        title={state.infoModal.title}
        type={state.infoModal.type}
      />
      <OnboardingModal
        isOpen={state.isOnboardingOpen}
        onClose={() => {
          actions.setIsOnboardingOpen(false);
          localStorage.setItem('astra_onboarding_shown', 'true');
        }}
        onStartProfile={actions.startProfileFromOnboarding}
      />
      <SettingsModal
        isOpen={state.isSettingsOpen}
        onClose={() => actions.setIsSettingsOpen(false)}
        userProfile={state.userProfile}
        onUpdateProfile={actions.updateProfile}
      />
    </div>
  );
}
