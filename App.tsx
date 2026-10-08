import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import {
  HindMadurai_400Regular,
  HindMadurai_500Medium,
  HindMadurai_600SemiBold,
  HindMadurai_700Bold,
} from '@expo-google-fonts/hind-madurai';
import { colors, spacing, shadows } from './src/config/theme';
import { useAuthStore } from './src/store/useAuthStore';
import { useNotificationStore } from './src/store/useNotificationStore';
import { Header } from './src/components/common/Header';
import { DisruptionAlertBanner } from './src/components/common/DisruptionAlertBanner';
import { BottomTabBar, TabKey } from './src/components/common/BottomTabBar';
import { AppModals } from './src/components/common/AppModals';
import { SplashScreen } from './src/features/splash/SplashScreen';
import { WelcomeScreen } from './src/features/welcome/WelcomeScreen';
import { OnboardingScreen } from './src/features/onboarding/OnboardingScreen';
import { AIGenerationScreen } from './src/features/generation/AIGenerationScreen';
import { MainRouter } from './src/features/main/MainRouter';
import { Booking, Destination, Experience } from './src/types/database';

type AppStage = 'splash' | 'welcome' | 'onboarding' | 'main';

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_700Bold,
    HindMadurai_400Regular,
    HindMadurai_500Medium,
    HindMadurai_600SemiBold,
    HindMadurai_700Bold,
  });

  const { role } = useAuthStore();
  const { activeBanner, dismissBanner, setupBusSubscription } = useNotificationStore();

  const [stage, setStage] = useState<AppStage>('splash');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [subView, setSubView] = useState<'none' | 'map' | 'live' | 'itinerary'>('none');
  const [isGenerating, setIsGenerating] = useState(false);

  const [showDemoControls, setShowDemoControls] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdaptiveModal, setShowAdaptiveModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    return setupBusSubscription();
  }, []);

  if (!fontsLoaded || stage === 'splash') {
    return <SplashScreen onFinish={() => setStage('main')} />;
  }

  if (stage === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => setStage('onboarding')}
        onLogin={() => setStage('main')}
      />
    );
  }

  if (stage === 'onboarding') {
    return (
      <OnboardingScreen
        onComplete={() => {
          setStage('main');
          setActiveTab('plan');
        }}
      />
    );
  }

  if (isGenerating) {
    return (
      <AIGenerationScreen
        onComplete={() => {
          setIsGenerating(false);
          setSubView('itinerary');
        }}
      />
    );
  }

  const appContent = (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="dark" />
      <Header
        onOpenDemoControls={() => setShowDemoControls(true)}
        onOpenLiveTrip={() => setSubView('live')}
      />

      {role === 'tourist' && (
        <DisruptionAlertBanner onOpenAdaptiveModal={() => setShowAdaptiveModal(true)} />
      )}

      {activeBanner && (
        <View style={styles.notifBanner}>
          <View style={styles.notifBannerCol}>
            <Text style={styles.notifBannerTitle}>🔔 {activeBanner.title}</Text>
            <Text style={styles.notifBannerBody}>{activeBanner.body}</Text>
          </View>
          <TouchableOpacity onPress={dismissBanner} style={styles.notifDismiss}>
            <Text style={styles.notifDismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.contentArea}>
        <MainRouter
          activeTab={activeTab}
          subView={subView}
          setActiveTab={setActiveTab}
          setSubView={setSubView}
          setIsGenerating={setIsGenerating}
          setSelectedDestination={setSelectedDestination}
          setSelectedExperience={setSelectedExperience}
          setShowNotifications={setShowNotifications}
        />
      </View>

      {role === 'tourist' && (
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSubView('none');
            setActiveTab(tab);
          }}
        />
      )}

      <AppModals
        showDemoControls={showDemoControls}
        onCloseDemoControls={() => setShowDemoControls(false)}
        showNotifications={showNotifications}
        onCloseNotifications={() => setShowNotifications(false)}
        showAdaptiveModal={showAdaptiveModal}
        onCloseAdaptiveModal={() => setShowAdaptiveModal(false)}
        selectedDestination={selectedDestination}
        onCloseDestination={() => setSelectedDestination(null)}
        onBookExperienceForDest={() => {
          setSelectedDestination(null);
          setActiveTab('explore');
        }}
        selectedExperience={selectedExperience}
        onCloseExperience={() => setSelectedExperience(null)}
        confirmedBooking={confirmedBooking}
        onCloseTicket={() => setConfirmedBooking(null)}
        onConfirmBooking={(booking) => {
          setSelectedExperience(null);
          setConfirmedBooking(booking);
        }}
        onSelectDestFromNotification={(destId) => {
          setSelectedDestination({ id: destId } as any);
        }}
      />
    </SafeAreaView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webBackdrop}>
        <View style={styles.webPhoneFrame}>{appContent}</View>
      </View>
    );
  }

  return appContent;
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    backgroundColor: '#EDE3D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webPhoneFrame: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    backgroundColor: colors.background,
    ...shadows.elevated,
    shadowColor: '#3A0F18',
    shadowOpacity: 0.18,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 12 },
    overflow: 'hidden',
  },
  appContainer: { flex: 1, backgroundColor: colors.background },
  contentArea: { flex: 1, backgroundColor: colors.background },
  notifBanner: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.card,
  },
  notifBannerCol: { flex: 1, paddingRight: spacing.sm },
  notifBannerTitle: { fontSize: 12, fontWeight: '800', color: colors.ink },
  notifBannerBody: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  notifDismiss: { padding: 4 },
  notifDismissText: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
});
