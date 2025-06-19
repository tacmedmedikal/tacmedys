import { useRouter } from 'expo-router';
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

interface Visit {
  id: string;
  customerName: string;
  doctorName: string;
  visitDate: any;
  purpose: string;
  status: 'tamamlandi' | 'beklemede' | 'iptal';
}

export default function VisitTrackingDashboard() {
  const { user } = useAuth();
  const router = useRouter();  const [stats, setStats] = useState({
    todayVisits: 0,
    weekVisits: 0,
    monthVisits: 0,
    totalCustomers: 0,
    totalDoctors: 0,
    // Performans metrikleri
    monthlyTarget: 20, // Aylık hedef ziyaret sayısı
    completionRate: 0, // Hedef tamamlama oranı
    avgVisitsPerDay: 0, // Günlük ortalama ziyaret
    topCustomer: '', // En çok ziyaret edilen müşteri
    thisMonthGrowth: 0, // Bu ayki büyüme oranı
  });
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Tarih hesaplamaları
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      
      const monthStart = new Date(today);
      monthStart.setDate(1);
      
      const lastMonthStart = new Date(monthStart);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      
      // Bugünkü ziyaretler
      const todayVisitsQuery = query(
        collection(db, 'visits'),
        where('userId', '==', user.uid),
        where('visitDate', '>=', today),
        where('visitDate', '<', new Date(today.getTime() + 24 * 60 * 60 * 1000))
      );
      
      // Haftalık ziyaretler
      const weekVisitsQuery = query(
        collection(db, 'visits'),
        where('userId', '==', user.uid),
        where('visitDate', '>=', weekStart)
      );
      
      // Aylık ziyaretler
      const monthVisitsQuery = query(
        collection(db, 'visits'),
        where('userId', '==', user.uid),
        where('visitDate', '>=', monthStart)
      );
      
      // Geçen ay ziyaretleri
      const lastMonthVisitsQuery = query(
        collection(db, 'visits'),
        where('userId', '==', user.uid),
        where('visitDate', '>=', lastMonthStart),
        where('visitDate', '<', monthStart)
      );
      
      // Tüm ziyaretler (performans analizi için)
      const allVisitsQuery = query(
        collection(db, 'visits'),
        where('userId', '==', user.uid),
        orderBy('visitDate', 'desc')
      );
      
      // Müşteriler
      const customersQuery = query(
        collection(db, 'customers'),
        where('userId', '==', user.uid)
      );
      
      // Son ziyaretler
      const recentVisitsQuery = query(
        collection(db, 'visits'),
        where('userId', '==', user.uid),
        orderBy('visitDate', 'desc'),
        limit(5)
      );

      const [
        todaySnapshot, 
        weekSnapshot, 
        monthSnapshot, 
        lastMonthSnapshot,
        allVisitsSnapshot,
        customersSnapshot,
        recentSnapshot
      ] = await Promise.all([
        getDocs(todayVisitsQuery),
        getDocs(weekVisitsQuery),
        getDocs(monthVisitsQuery),
        getDocs(lastMonthVisitsQuery),
        getDocs(allVisitsQuery),
        getDocs(customersQuery),
        getDocs(recentVisitsQuery)
      ]);

      // Performans hesaplamaları
      const thisMonthVisits = monthSnapshot.size;
      const lastMonthVisits = lastMonthSnapshot.size;
      const totalVisits = allVisitsSnapshot.size;
      
      // En çok ziyaret edilen müşteri
      const customerVisits: { [key: string]: number } = {};
      allVisitsSnapshot.forEach(doc => {
        const data = doc.data();
        const customerName = data.customerName;
        customerVisits[customerName] = (customerVisits[customerName] || 0) + 1;
      });
      
      const topCustomer = Object.keys(customerVisits).reduce((a, b) => 
        customerVisits[a] > customerVisits[b] ? a : b, ''
      );
      
      // Büyüme oranı hesaplama
      const growthRate = lastMonthVisits > 0 
        ? ((thisMonthVisits - lastMonthVisits) / lastMonthVisits * 100)
        : (thisMonthVisits > 0 ? 100 : 0);
      
      // Günlük ortalama (son 30 gün)
      const avgVisitsPerDay = totalVisits > 0 ? totalVisits / 30 : 0;
      
      // Hedef tamamlama oranı
      const monthlyTarget = 20; // Bu değer kullanıcı tarafından ayarlanabilir
      const completionRate = (thisMonthVisits / monthlyTarget) * 100;

      setStats({
        todayVisits: todaySnapshot.size,
        weekVisits: weekSnapshot.size,
        monthVisits: thisMonthVisits,
        totalCustomers: customersSnapshot.size,
        totalDoctors: 0, // Bu değer doktor koleksiyonundan gelecek
        monthlyTarget,
        completionRate: Math.min(completionRate, 100),
        avgVisitsPerDay: Math.round(avgVisitsPerDay * 10) / 10,
        topCustomer: topCustomer || 'Henüz ziyaret yok',
        thisMonthGrowth: Math.round(growthRate * 10) / 10,
      });

      const visits: Visit[] = [];
      recentSnapshot.forEach(doc => {
        visits.push({ id: doc.id, ...doc.data() } as Visit);
      });
      setRecentVisits(visits);

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  const navigateToNewVisit = () => {
    router.push('/user/add-visit');
  };

  const navigateToCustomers = () => {
    router.push('/user/customers');
  };

  const navigateToDoctors = () => {
    // Navigate to doctors screen
    Alert.alert('Doktorlar', 'Doktor yönetimi yakında eklenecek.');
  };
  const navigateToReports = () => {
    // Navigate to reports screen
    Alert.alert('Raporlar', 'Raporlar sayfası yakında eklenecek.');
  };

  const navigateToVisitHistory = () => {
    router.push('/user/visit-history');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ziyaret Takip Sistemi</Text>
        <Text style={styles.subtitle}>Hoşgeldiniz, {user?.email}</Text>
      </View>      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.todayVisits}</Text>
          <Text style={styles.statLabel}>Bugünkü Ziyaretler</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.weekVisits}</Text>
          <Text style={styles.statLabel}>Haftalık</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.monthVisits}</Text>
          <Text style={styles.statLabel}>Aylık</Text>
        </View>
      </View>

      {/* Performance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performans Analizi</Text>
        
        {/* Monthly Target Progress */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>Aylık Hedef</Text>
            <Text style={styles.performanceValue}>{stats.monthVisits}/{stats.monthlyTarget}</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(stats.completionRate, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>%{Math.round(stats.completionRate)} tamamlandı</Text>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📈</Text>
            <Text style={styles.metricValue}>{stats.thisMonthGrowth > 0 ? '+' : ''}{stats.thisMonthGrowth}%</Text>
            <Text style={styles.metricLabel}>Bu Ay Büyüme</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>⭐</Text>
            <Text style={styles.metricValue}>{stats.avgVisitsPerDay}</Text>
            <Text style={styles.metricLabel}>Günlük Ortalama</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🏆</Text>
            <Text style={styles.metricValue} numberOfLines={1}>{stats.topCustomer}</Text>
            <Text style={styles.metricLabel}>En Aktif Müşteri</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={navigateToNewVisit}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Yeni Ziyaret</Text>
            <Text style={styles.actionSubtitle}>Ziyaret ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={navigateToCustomers}>
            <Text style={styles.actionIcon}>🏥</Text>
            <Text style={styles.actionTitle}>Müşteriler</Text>
            <Text style={styles.actionSubtitle}>Hastane/Klinik</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={navigateToDoctors}>
            <Text style={styles.actionIcon}>👨‍⚕️</Text>
            <Text style={styles.actionTitle}>Doktorlar</Text>
            <Text style={styles.actionSubtitle}>Doktor listesi</Text>
          </TouchableOpacity>          <TouchableOpacity style={styles.actionCard} onPress={navigateToReports}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>Raporlar</Text>
            <Text style={styles.actionSubtitle}>Analiz & Rapor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={navigateToVisitHistory}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>Ziyaret Geçmişi</Text>
            <Text style={styles.actionSubtitle}>Tüm ziyaretler</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Visits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Ziyaretler</Text>
        {recentVisits.length > 0 ? (
          recentVisits.map((visit) => (
            <View key={visit.id} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <Text style={styles.visitCustomer}>{visit.customerName}</Text>
                <Text style={styles.visitDate}>
                  {new Date(visit.visitDate?.toDate()).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <Text style={styles.visitDoctor}>Dr. {visit.doctorName}</Text>
              <Text style={styles.visitPurpose}>{visit.purpose}</Text>
              <View style={styles.visitStatus}>
                <Text style={[
                  styles.statusBadge,
                  { backgroundColor: visit.status === 'tamamlandi' ? '#10b981' : '#f59e0b' }
                ]}>
                  {visit.status === 'tamamlandi' ? 'Tamamlandı' : 'Beklemede'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Henüz ziyaret kaydı bulunmamaktadır.</Text>
            <TouchableOpacity style={styles.emptyAction} onPress={navigateToNewVisit}>
              <Text style={styles.emptyActionText}>İlk ziyaretinizi ekleyin</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
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
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  visitCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  visitDate: {
    fontSize: 12,
    color: '#64748b',
  },
  visitDoctor: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  visitPurpose: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  visitStatus: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
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
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAction: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },  emptyActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Performance Section Styles
  performanceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
