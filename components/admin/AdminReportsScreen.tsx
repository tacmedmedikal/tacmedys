import { useRouter } from 'expo-router';
import {
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../firebaseConfig';

interface UserStats {
  userId: string;
  email: string;
  visitCount: number;
  lastVisit: Date | null;
  customerCount: number;
  doctorCount: number;
}

interface TimeframeStats {
  period: string;
  totalVisits: number;
  uniqueUsers: number;
  avgVisitsPerUser: number;
}

export default function AdminReportsScreen() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [timeframeStats, setTimeframeStats] = useState<TimeframeStats[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [selectedTimeframe]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Kullanıcı verilerini çek
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const visitsSnapshot = await getDocs(collection(db, 'visits'));
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));

      // Kullanıcı istatistiklerini hesapla
      const userStatsMap: { [key: string]: UserStats } = {};
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.role === 'user') {
          userStatsMap[doc.id] = {
            userId: doc.id,
            email: userData.email,
            visitCount: 0,
            lastVisit: null,
            customerCount: 0,
            doctorCount: 0,
          };
        }
      });

      // Ziyaret verilerini işle
      visitsSnapshot.forEach(doc => {
        const visitData = doc.data();
        const userId = visitData.userId;
        
        if (userStatsMap[userId]) {
          userStatsMap[userId].visitCount++;
          
          const visitDate = visitData.visitDate?.toDate();
          if (visitDate && (!userStatsMap[userId].lastVisit || visitDate > userStatsMap[userId].lastVisit!)) {
            userStatsMap[userId].lastVisit = visitDate;
          }
        }
      });

      // Müşteri sayılarını hesapla
      customersSnapshot.forEach(doc => {
        const customerData = doc.data();
        const userId = customerData.userId;
        if (userStatsMap[userId]) {
          userStatsMap[userId].customerCount++;
        }
      });

      // Doktor sayılarını hesapla
      doctorsSnapshot.forEach(doc => {
        const doctorData = doc.data();
        const userId = doctorData.userId;
        if (userStatsMap[userId]) {
          userStatsMap[userId].doctorCount++;
        }
      });

      const sortedUserStats = Object.values(userStatsMap)
        .sort((a, b) => b.visitCount - a.visitCount);

      setUserStats(sortedUserStats);

      // Zaman dilimi istatistiklerini hesapla
      await calculateTimeframeStats();

    } catch (error) {
      console.error('Error fetching report data:', error);
      Alert.alert('Hata', 'Rapor verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeframeStats = async () => {
    const now = new Date();
    const timeframes = [];

    for (let i = 0; i < 6; i++) {
      let startDate, endDate, periodName;
      
      if (selectedTimeframe === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - (i + 1) * 7);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        periodName = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
      } else if (selectedTimeframe === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - i, 0);
        periodName = `${startDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`;
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth() - (i + 1) * 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - i * 3, 0);
        periodName = `Q${Math.floor((startDate.getMonth() / 3)) + 1} ${startDate.getFullYear()}`;
      }

      try {
        const visitsQuery = query(
          collection(db, 'visits'),
          where('visitDate', '>=', startDate),
          where('visitDate', '<=', endDate)
        );
        
        const visitsSnapshot = await getDocs(visitsQuery);
        const uniqueUsers = new Set();
        
        visitsSnapshot.forEach(doc => {
          uniqueUsers.add(doc.data().userId);
        });

        timeframes.push({
          period: periodName,
          totalVisits: visitsSnapshot.size,
          uniqueUsers: uniqueUsers.size,
          avgVisitsPerUser: uniqueUsers.size > 0 ? visitsSnapshot.size / uniqueUsers.size : 0,
        });
      } catch (error) {
        console.error('Error calculating timeframe stats:', error);
      }
    }

    setTimeframeStats(timeframes.reverse());
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
        <Text style={styles.loadingText}>Raporlar hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Performans Raporları</Text>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zaman Dilimi</Text>
        <View style={styles.timeframeSelector}>
          {(['week', 'month', 'quarter'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextActive
              ]}>
                {timeframe === 'week' ? 'Haftalık' : 
                 timeframe === 'month' ? 'Aylık' : 'Çeyreklik'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timeframe Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zaman Dilimi Analizi</Text>
        {timeframeStats.map((stat, index) => (
          <View key={index} style={[styles.timeframeCard, shadowStyle]}>
            <Text style={styles.timeframePeriod}>{stat.period}</Text>
            <View style={styles.timeframeStats}>
              <View style={styles.timeframeStat}>
                <Text style={styles.timeframeStatValue}>{stat.totalVisits}</Text>
                <Text style={styles.timeframeStatLabel}>Toplam Ziyaret</Text>
              </View>
              <View style={styles.timeframeStat}>
                <Text style={styles.timeframeStatValue}>{stat.uniqueUsers}</Text>
                <Text style={styles.timeframeStatLabel}>Aktif Kullanıcı</Text>
              </View>
              <View style={styles.timeframeStat}>
                <Text style={styles.timeframeStatValue}>{stat.avgVisitsPerUser.toFixed(1)}</Text>
                <Text style={styles.timeframeStatLabel}>Ort. Ziyaret</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* User Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kullanıcı Performansı</Text>
        {userStats.slice(0, 10).map((user, index) => (
          <View key={user.userId} style={[styles.userCard, shadowStyle]}>
            <View style={styles.userRank}>
              <Text style={styles.userRankText}>{index + 1}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userLastVisit}>
                Son ziyaret: {user.lastVisit ? 
                  user.lastVisit.toLocaleDateString('tr-TR') : 
                  'Henüz ziyaret yok'
                }
              </Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.userStat}>
                <Text style={styles.userStatValue}>{user.visitCount}</Text>
                <Text style={styles.userStatLabel}>Ziyaret</Text>
              </View>
              <View style={styles.userStat}>
                <Text style={styles.userStatValue}>{user.customerCount}</Text>
                <Text style={styles.userStatLabel}>Müşteri</Text>
              </View>
            </View>
          </View>
        ))}
        
        {userStats.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz kullanıcı verisi bulunmuyor</Text>
          </View>
        )}
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
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
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
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  timeframeButtonTextActive: {
    color: '#fff',
  },
  timeframeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeframePeriod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  timeframeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeframeStat: {
    alignItems: 'center',
  },
  timeframeStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  timeframeStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userRankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userLastVisit: {
    fontSize: 12,
    color: '#6b7280',
  },
  userStats: {
    flexDirection: 'row',
    gap: 20,
  },
  userStat: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 2,
  },
  userStatLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
