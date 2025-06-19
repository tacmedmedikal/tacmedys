import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CalendarService from '../../utils/calendarService';

export default function CalendarSettingsScreen() {
  const router = useRouter();
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const preference = await CalendarService.getUserCalendarPreference();
      setCalendarSyncEnabled(preference);
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    try {
      if (enabled) {
        // İzin kontrolü
        const hasPermission = await CalendarService.requestCalendarPermissions();
        if (!hasPermission) {
          return;
        }

        // Takvim oluştur
        const calendarId = await CalendarService.getOrCreateDefaultCalendar();
        if (!calendarId) {
          Alert.alert('Hata', 'Takvim oluşturulamadı. Lütfen tekrar deneyin.');
          return;
        }

        Alert.alert(
          'Başarılı',
          'TacMed Ziyaretler takvimi oluşturuldu. Artık ziyaretleriniz otomatik olarak takviminize eklenecek.',
          [{ text: 'Tamam' }]
        );
      }

      setCalendarSyncEnabled(enabled);
      await CalendarService.setUserCalendarPreference(enabled);
    } catch (error) {
      console.error('Error toggling calendar sync:', error);
      Alert.alert('Hata', 'Ayarlar güncellenirken bir hata oluştu.');
    }
  };

  const testCalendarIntegration = async () => {
    try {
      setLoading(true);
      
      const hasPermission = await CalendarService.requestCalendarPermissions();
      if (!hasPermission) {
        Alert.alert('İzin Gerekli', 'Takvim testı için izin gereklidir.');
        return;
      }

      // Test etkinliği oluştur
      const testEvent = CalendarService.prepareVisitEvent({
        customerName: 'Test Hastanesi',
        doctorName: 'Dr. Test',
        visitDate: new Date(Date.now() + 60 * 60 * 1000), // 1 saat sonra
        purpose: 'Test ziyareti',
        notes: 'Bu bir test etkinliğidir.',
        location: 'Test Lokasyonu',
      });

      const eventId = await CalendarService.createVisitEvent(testEvent);
      
      if (eventId) {
        Alert.alert(
          'Test Başarılı',
          'Test etkinliği takviminize eklendi. Takvim uygulamanızı kontrol edebilirsiniz.',
          [
            { text: 'Tamam' },
            { 
              text: 'Test Etkinliğini Sil', 
              onPress: () => CalendarService.deleteVisitEvent(eventId)
            }
          ]
        );
      } else {
        Alert.alert('Test Başarısız', 'Test etkinliği oluşturulamadı.');
      }
    } catch (error) {
      console.error('Error testing calendar integration:', error);
      Alert.alert('Hata', 'Test sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
    default: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Takvim Ayarları</Text>
      </View>

      <View style={styles.content}>
        {/* Main Toggle */}
        <View style={[styles.settingCard, shadowStyle]}>
          <View style={styles.settingHeader}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Takvim Entegrasyonu</Text>
              <Text style={styles.settingDescription}>
                Ziyaretlerinizi otomatik olarak Google Takvim'e ekler
              </Text>
            </View>
            <Switch
              value={calendarSyncEnabled}
              onValueChange={handleToggleSync}
              trackColor={{ false: '#f1f5f9', true: '#3b82f6' }}
              thumbColor={calendarSyncEnabled ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Information Cards */}
        <View style={[styles.infoCard, shadowStyle]}>
          <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Yeni ziyaret eklediğinizde otomatik olarak takviminize eklenir</Text>
            <Text style={styles.infoItem}>• Ziyaret 1 saat öncesi ve 15 dakika öncesi bildirim alırsınız</Text>
            <Text style={styles.infoItem}>• Müşteri adı, doktor bilgisi ve ziyaret amacı etkinlik detayında görünür</Text>
            <Text style={styles.infoItem}>• "TacMed Ziyaretler" adında özel bir takvim oluşturulur</Text>
          </View>
        </View>

        {/* Test Button */}
        {calendarSyncEnabled && (
          <TouchableOpacity 
            style={[styles.testButton, shadowStyle]}
            onPress={testCalendarIntegration}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>
              {loading ? 'Test Ediliyor...' : 'Takvim Entegrasyonunu Test Et'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Privacy Info */}
        <View style={[styles.privacyCard, shadowStyle]}>
          <Text style={styles.privacyTitle}>Gizlilik ve Güvenlik</Text>
          <Text style={styles.privacyText}>
            Bu özellik yalnızca cihazınızdaki takvim uygulamasına erişim sağlar. 
            Verileriniz hiçbir zaman sunucularımıza gönderilmez ve tamamen cihazınızda kalır.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});
