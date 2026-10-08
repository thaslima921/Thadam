import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../config/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { HomeScreen } from '../home/HomeScreen';
import { CreateTripScreen } from '../planner/CreateTripScreen';
import { ItineraryScreen } from '../itinerary/ItineraryScreen';
import { ExploreScreen } from '../explore/ExploreScreen';
import { MapScreen } from '../map/MapScreen';
import { LiveTripScreen } from '../liveTrip/LiveTripScreen';
import { PartnerPortal } from '../partner/PartnerPortal';
import { AdminPortal } from '../admin/AdminPortal';
import { TripsScreen } from '../trips/TripsScreen';
import { ProfileScreen } from '../profile/ProfileScreen';
import { TabKey } from '../../components/common/BottomTabBar';
import { Destination, Experience } from '../../types/database';

interface MainRouterProps {
  activeTab: TabKey;
  subView: 'none' | 'map' | 'live' | 'itinerary';
  setActiveTab: (tab: TabKey) => void;
  setSubView: (view: 'none' | 'map' | 'live' | 'itinerary') => void;
  setIsGenerating: (gen: boolean) => void;
  setSelectedDestination: (dest: Destination | null) => void;
  setSelectedExperience: (exp: Experience | null) => void;
  setShowNotifications: (show: boolean) => void;
}

export const MainRouter: React.FC<MainRouterProps> = ({
  activeTab,
  subView,
  setActiveTab,
  setSubView,
  setIsGenerating,
  setSelectedDestination,
  setSelectedExperience,
  setShowNotifications,
}) => {
  const { role } = useAuthStore();
  const { startLiveTrip } = useTripStore();

  if (role === 'partner') return <PartnerPortal />;
  if (role === 'admin') return <AdminPortal />;

  if (subView === 'itinerary') {
    return (
      <ItineraryScreen
        onOpenMap={() => setSubView('map')}
        onStartLiveTrip={() => {
          startLiveTrip();
          setSubView('live');
        }}
        onModifyPreferences={() => {
          setSubView('none');
          setActiveTab('plan');
        }}
      />
    );
  }
  if (subView === 'map') return <MapScreen />;
  if (subView === 'live') {
    return (
      <LiveTripScreen
        onBackToItinerary={() => setSubView('itinerary')}
        onOpenMap={() => setSubView('map')}
      />
    );
  }

  switch (activeTab) {
    case 'home':
      return (
        <HomeScreen
          onPlanTrip={() => setActiveTab('plan')}
          onExplore={() => setActiveTab('explore')}
          onSelectDestination={setSelectedDestination}
          onSelectExperience={setSelectedExperience}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenNotifications={() => setShowNotifications(true)}
          onResumeLiveTrip={() => setSubView('live')}
        />
      );
    case 'explore':
      return (
        <ExploreScreen
          onSelectDestination={setSelectedDestination}
          onSelectExperience={setSelectedExperience}
        />
      );
    case 'plan':
      return <CreateTripScreen onBuildTrip={() => setIsGenerating(true)} />;
    case 'trips':
      return (
        <TripsScreen
          onContinueTrip={() => setSubView('itinerary')}
          onPlanNew={() => setActiveTab('plan')}
        />
      );
    case 'profile':
      return (
        <ProfileScreen
          onBack={() => setActiveTab('home')}
          onOpenNotifications={() => setShowNotifications(true)}
        />
      );
  }
};
