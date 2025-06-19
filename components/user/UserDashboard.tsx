import { router } from 'expo-router';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface QuickActionProps {
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, color, onPress }) => (
  <TouchableOpacity style={[styles.actionCard, { borderTopColor: color }]} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color }]} />
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </View>
    <Text style={styles.actionArrow}>›</Text>
  </TouchableOpacity>
);

interface InfoCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, subtitle, color }) => (
  <View style={[styles.infoCard, { borderLeftColor: color }]}>
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={[styles.infoValue, { color }]}>{value}</Text>
    <Text style={styles.infoSubtitle}>{subtitle}</Text>
  </View>
);

export default function UserDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
          <Text style={styles.userText}>Kullanıcı Paneli</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Çıkış</Text>
        </TouchableOpacity>
      </View>      {/* User Info Cards */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <InfoCard
            title="Bu Ay Ziyaret"
            value="12"
            subtitle="Toplam 8 müşteri"
            color="#3b82f6"
          />
          <InfoCard
            title="Hedef Tamamlama"
            value="%75"
            subtitle="Çok iyi gidiyorsun!"
            color="#10b981"
          />
        </View>
        <View style={styles.infoRow}>
          <InfoCard
            title="Son Ziyaret"
            value="Dün"
            subtitle="Memorial Hastanesi"
            color="#f59e0b"
          />
          <InfoCard
            title="Aktif Müşteri"
            value="24"
            subtitle="Hastane/Klinik"
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>        <QuickAction
          title="Ziyaret Takibi"
          description="Hastane/klinik ziyaretlerini yönet"
          color="#3b82f6"
          onPress={() => router.push('/user/visit-tracking')}
        />
        
        <QuickAction
          title="Müşteri Yönetimi"
          description="Hastane ve klinik bilgilerini görüntüle"
          color="#10b981"
          onPress={() => router.push('/user/customers')}
        />
        
        <QuickAction
          title="Yeni Sipariş Ver"
          description="Ürün katalogunu incele ve sipariş oluştur"
          color="#f59e0b"
          onPress={() => alert('Ürün katalogu sayfasına yönlendirilecek')}
        />
        
        <QuickAction
          title="Siparişlerim"
          description="Geçmiş ve aktif siparişlerini görüntüle"
          color="#ef4444"
          onPress={() => router.push('/user/orders')}
        />
          <QuickAction
          title="Profil Ayarları"
          description="Kişisel bilgileri ve ayarları güncelle"
          color="#8b5cf6"
          onPress={() => router.push('/user/profile')}
        />
        
        <QuickAction
          title="Takvim Ayarları"
          description="Google Takvim entegrasyonu"
          color="#10b981"
          onPress={() => router.push('/user/calendar-settings')}
        />
        
        <QuickAction
          title="Destek"
          description="Yardım ve müşteri hizmetleri"
          color="#6b7280"
          onPress={() => router.push('/user/support')}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
        
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: '#10b981' }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Sipariş #1234 teslim edildi</Text>
            <Text style={styles.activityTime}>2 saat önce</Text>
          </View>
        </View>
        
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: '#3b82f6' }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Yeni ürün favorilere eklendi</Text>
            <Text style={styles.activityTime}>1 gün önce</Text>
          </View>
        </View>
        
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: '#f59e0b' }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Profil bilgileri güncellendi</Text>
            <Text style={styles.activityTime}>3 gün önce</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#059669',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  welcomeText: {
    color: '#a7f3d0',
    fontSize: 14,
  },
  userText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  emailText: {
    color: '#6ee7b7',
    fontSize: 12,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  infoTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderTopWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  actionIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 8,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
