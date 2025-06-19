import { router } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebaseConfig';

interface DashboardCardProps {
  title: string;
  value: string;
  color: string;
  onPress?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, color, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={[styles.cardValue, { color }]}>{value}</Text>
  </TouchableOpacity>
);

interface MenuItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, subtitle, onPress, color }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: color }]} />
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisits: 0,
    totalCustomers: 0,
    totalDoctors: 0,
    todayVisits: 0,
    weekVisits: 0,
    monthVisits: 0,
    activeUsers: 0,
  });
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // Bugünün başlangıcı
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Bu haftanın başlangıcı
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      // Bu ayın başlangıcı
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Paralel veri çekme
      const [
        usersSnapshot,
        visitsSnapshot,
        customersSnapshot,
        doctorsSnapshot,
        todayVisitsSnapshot,
        weekVisitsSnapshot,
        monthVisitsSnapshot,
        recentVisitsSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'visits')),
        getDocs(collection(db, 'customers')),
        getDocs(collection(db, 'doctors')),
        getDocs(query(collection(db, 'visits'), where('visitDate', '>=', today))),
        getDocs(query(collection(db, 'visits'), where('visitDate', '>=', weekStart))),
        getDocs(query(collection(db, 'visits'), where('visitDate', '>=', monthStart))),
        getDocs(query(collection(db, 'visits'), orderBy('visitDate', 'desc'), limit(10)))
      ]);

      // Son aktiviteleri düzenle
      const activities: any[] = [];
      recentVisitsSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'visit',
          description: `${data.customerName} - ${data.doctorName}`,
          user: data.userId,
          date: data.visitDate,
        });
      });

      setStats({
        totalUsers: usersSnapshot.size,
        totalVisits: visitsSnapshot.size,
        totalCustomers: customersSnapshot.size,
        totalDoctors: doctorsSnapshot.size,
        todayVisits: todayVisitsSnapshot.size,
        weekVisits: weekVisitsSnapshot.size,
        monthVisits: monthVisitsSnapshot.size,
        activeUsers: usersSnapshot.docs.filter(doc => doc.data().role === 'user').length,
      });

      setRecentActivity(activities);
      
      // En performanslı kullanıcıları hesapla (basit implementasyon)
      const userVisitCounts: { [key: string]: number } = {};
      visitsSnapshot.forEach(doc => {
        const userId = doc.data().userId;
        userVisitCounts[userId] = (userVisitCounts[userId] || 0) + 1;
      });

      const performers = Object.entries(userVisitCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({ userId, visitCount: count }));
      
      setTopPerformers(performers);

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
          <Text style={styles.adminText}>Yönetici Paneli</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Çıkış</Text>
        </TouchableOpacity>
      </View>      {/* Dashboard Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.cardRow}>
          <DashboardCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers.toString()}
            color="#3b82f6"
          />
          <DashboardCard
            title="Aktif Kullanıcı"
            value={stats.activeUsers.toString()}
            color="#10b981"
          />
        </View>
        <View style={styles.cardRow}>
          <DashboardCard
            title="Toplam Ziyaret"
            value={stats.totalVisits.toString()}
            color="#f59e0b"
          />
          <DashboardCard
            title="Bu Ay"
            value={stats.monthVisits.toString()}
            color="#ef4444"
          />
        </View>
        <View style={styles.cardRow}>
          <DashboardCard
            title="Müşteri Sayısı"
            value={stats.totalCustomers.toString()}
            color="#8b5cf6"
          />
          <DashboardCard
            title="Doktor Sayısı"
            value={stats.totalDoctors.toString()}
            color="#06b6d4"
          />
        </View>
      </View>

      {/* Performance Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performans Özeti</Text>
        <View style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>Bugün</Text>
            <Text style={styles.performanceValue}>{stats.todayVisits}</Text>
            <Text style={styles.performanceLabel}>Ziyaret</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>Bu Hafta</Text>
            <Text style={styles.performanceValue}>{stats.weekVisits}</Text>
            <Text style={styles.performanceLabel}>Ziyaret</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>Ortalama</Text>
            <Text style={styles.performanceValue}>
              {stats.totalUsers > 0 ? Math.round(stats.monthVisits / stats.totalUsers) : 0}
            </Text>
            <Text style={styles.performanceLabel}>Ziyaret/Kullanıcı</Text>
          </View>
        </View>
      </View>      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sistem Yönetimi</Text>
        
        <MenuItem
          title="Kullanıcı Yönetimi"
          subtitle="Kullanıcıları görüntüle ve yönet"
          onPress={() => router.push('/admin/users')}
          color="#3b82f6"
        />
        
        <MenuItem
          title="Ziyaret Yönetimi"
          subtitle="Tüm ziyaretleri görüntüle ve analiz et"
          onPress={() => alert('Ziyaret yönetimi yakında eklenecek')}
          color="#10b981"
        />
        
        <MenuItem
          title="Müşteri & Doktor Yönetimi"
          subtitle="Hastane, klinik ve doktor verilerini yönet"
          onPress={() => alert('Müşteri yönetimi yakında eklenecek')}
          color="#f59e0b"
        />
          <MenuItem
          title="Performans Raporları"
          subtitle="Detaylı analiz ve raporlar"
          onPress={() => router.push('/admin/admin-reports')}
          color="#8b5cf6"
        />
        
        <MenuItem
          title="Sistem Ayarları"
          subtitle="Uygulama ve güvenlik ayarları"
          onPress={() => router.push('/admin/settings')}
          color="#6b7280"
        />
      </View>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          {recentActivity.slice(0, 5).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>📋</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.description}</Text>
                <Text style={styles.activityTime}>
                  {activity.date?.toDate ? 
                    activity.date.toDate().toLocaleDateString('tr-TR') : 
                    'Tarih belirsiz'
                  }
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  welcomeText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  adminText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  emailText: {
    color: '#64748b',
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
  cardsContainer: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
  menuItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
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
  menuIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
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
  performanceTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  activityItem: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
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
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
