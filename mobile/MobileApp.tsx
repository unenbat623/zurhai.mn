import { lazy, Suspense } from 'react';
import { Loader2, Star } from 'lucide-react';
import { useAstraApp } from '../frontend/hooks/useAstraApp';
import { SIGN_NAMES_MN } from '../frontend/types';
import { MobileHeader, MobileHomeCard, MobileZodiacGrid, SectionTitle } from './MobileChrome';
import MobileQuotaError from './MobileQuotaError';
import MobileTabBar from './MobileTabBar';

const AdminUsersView = lazy(() => import('../frontend/components/AdminUsersView'));
const ChartSection = lazy(() => import('../frontend/components/ChartSection'));
const CompatibilityView = lazy(() => import('../frontend/components/CompatibilityView'));
const GeneralInfoModal = lazy(() => import('../frontend/components/GeneralInfoModal'));
const HoroscopeDisplay = lazy(() => import('../frontend/components/HoroscopeDisplay'));
const NumerologyView = lazy(() => import('../frontend/components/NumerologyView'));
const OnboardingModal = lazy(() => import('../frontend/components/OnboardingModal'));
const SettingsModal = lazy(() => import('../frontend/components/SettingsModal'));
const ShopView = lazy(() => import('../frontend/components/ShopView'));
const SubscriptionModal = lazy(() => import('../frontend/components/SubscriptionModal'));
const TarotView = lazy(() => import('../frontend/components/TarotView'));

export default function MobileApp() {
  const { state, actions } = useAstraApp();
  const signName = state.userProfile?.sunSign ? SIGN_NAMES_MN[state.userProfile.sunSign] : undefined;

  return (
    <div className="mobile-app relative min-h-screen overflow-x-hidden bg-cosmos-black pb-24 font-sans text-slate-200">
      <MobileHeader
        isPremium={state.isPremium}
        userName={state.userProfile?.name}
        onOpenSettings={() => actions.setIsSettingsOpen(true)}
        onOpenSubscription={() => actions.setSubModalOpen(true)}
      />

      <main className="relative z-10 mx-auto w-full max-w-md px-4 pb-6 pt-5">
        {state.activeTab !== 'admin' && (
          <MobileHomeCard
            isPremium={state.isPremium}
            signName={signName}
            userName={state.userProfile?.name}
            onOpenChart={() => actions.setActiveTab('chart')}
            onOpenSubscription={() => actions.setSubModalOpen(true)}
          />
        )}

        <MobileQuotaError error={state.error} onRetry={actions.retryAstroRequests} />

        <section className="mobile-screen mt-5 min-h-[520px]">
          <Suspense fallback={<MobileLoading />}>
            {state.activeTab === 'horoscope' && (
              <div className="space-y-5">
                <SectionTitle icon={<Star size={16} />} title={'\u04e8\u0434\u0440\u0438\u0439\u043d \u0437\u0443\u0440\u0445\u0430\u0439'} />
                <MobileZodiacGrid onSelect={actions.setSelectedSign} selectedSign={state.selectedSign} />
                {(state.horoscope || state.loading) && (
                  <HoroscopeDisplay data={state.horoscope} isLoading={state.loading} isPersonalized={!!state.chartInterpretation} />
                )}
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

            {state.activeTab === 'numerology' && <NumerologyView userProfile={state.userProfile} />}
            {state.activeTab === 'shop' && <ShopView onPurchase={actions.handlePurchase} isLoading={state.purchaseLoading} />}
            {state.activeTab === 'compatibility' && <CompatibilityView />}
            {state.activeTab === 'tarot' && <TarotView />}
            {state.activeTab === 'admin' && (
              <AdminUsersView
                activeProfile={state.userProfile}
                users={state.users}
                onAddUser={actions.addUser}
                onDeleteUser={actions.deleteUser}
                onSelectUser={actions.selectUser}
              />
            )}
          </Suspense>
        </section>
      </main>

      <MobileTabBar activeTab={state.activeTab} alwaysVisible onChange={actions.setActiveTab} />

      <Suspense fallback={null}>
        {state.isSubModalOpen && <SubscriptionModal isOpen={state.isSubModalOpen} onClose={() => actions.setSubModalOpen(false)} onUpgrade={actions.upgradeToPremium} />}
        {state.infoModal.isOpen && (
          <GeneralInfoModal
            isOpen={state.infoModal.isOpen}
            onClose={() => actions.setInfoModal({ ...state.infoModal, isOpen: false })}
            title={state.infoModal.title}
            type={state.infoModal.type}
          />
        )}
        {state.isOnboardingOpen && (
          <OnboardingModal
            isOpen={state.isOnboardingOpen}
            onClose={() => {
              actions.setIsOnboardingOpen(false);
              localStorage.setItem('astra_onboarding_shown', 'true');
            }}
            onStartProfile={actions.startProfileFromOnboarding}
          />
        )}
        {state.isSettingsOpen && (
          <SettingsModal
            isOpen={state.isSettingsOpen}
            onClose={() => actions.setIsSettingsOpen(false)}
            userProfile={state.userProfile}
            onUpdateProfile={actions.updateProfile}
          />
        )}
      </Suspense>
    </div>
  );
}

function MobileLoading() {
  return (
    <div className="glass-card flex min-h-48 items-center justify-center border-white/10 bg-slate-900/40">
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
        <Loader2 size={16} className="animate-spin" />
        Loading
      </div>
    </div>
  );
}
