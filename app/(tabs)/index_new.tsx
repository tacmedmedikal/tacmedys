import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return null; // Auth redirect will handle this
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">TacMedikal'e Hoş Geldiniz!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Kullanıcı Bilgileri</ThemedText>
        <ThemedText>
          Email: <ThemedText type="defaultSemiBold">{user?.email}</ThemedText>
        </ThemedText>
        <ThemedText>
          Giriş Zamanı: <ThemedText type="defaultSemiBold">{new Date().toLocaleString('tr-TR')}</ThemedText>
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Çıkış Yap</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
