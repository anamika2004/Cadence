import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { CadenceProvider, useCadence } from './src/state/CadenceContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { FeedbackScreen } from './src/screens/FeedbackScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { CycleScreen } from './src/screens/CycleScreen';
import { MoveScreen } from './src/screens/MoveScreen';
import { FuelScreen } from './src/screens/FuelScreen';
import { TabBar, TabId } from './src/components/TabBar';
import { color } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return <View style={styles.blank} />;

  return (
    <SafeAreaProvider>
      <CadenceProvider>
        <Root />
      </CadenceProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

function Root() {
  const { ready, onboarded } = useCadence();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>('today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (!ready) return <View style={styles.blank} />;
  if (!onboarded) return <OnboardingScreen />;

  if (feedbackOpen) {
    return <FeedbackScreen onClose={() => setFeedbackOpen(false)} />;
  }

  if (settingsOpen) {
    return <SettingsScreen onClose={() => setSettingsOpen(false)} onOpenFeedback={() => setFeedbackOpen(true)} />;
  }

  return (
    <View style={[styles.app, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={{ flex: 1 }}>
        {tab === 'today' && <TodayScreen onNavigate={setTab} onOpenSettings={() => setSettingsOpen(true)} />}
        {tab === 'cycle' && <CycleScreen />}
        {tab === 'move' && <MoveScreen />}
        {tab === 'fuel' && <FuelScreen />}
      </View>
      <TabBar active={tab} onChange={setTab} bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1, backgroundColor: color.bg },
  app: { flex: 1, backgroundColor: color.bg },
});
