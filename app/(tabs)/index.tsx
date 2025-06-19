import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AdminDashboard from '../../components/admin/AdminDashboard';
import UserDashboard from '../../components/user/UserDashboard';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

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

  // Rol tabanlı dashboard gösterimi
  if (userRole === 'admin') {
    return <AdminDashboard />;  } else {
    return <UserDashboard />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
