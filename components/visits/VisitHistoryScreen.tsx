import { useRouter } from 'expo-router';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebaseConfig';
import CalendarService from '../../utils/calendarService';

interface Visit {
  id: string;
  customerName: string;
  doctorName: string;
  doctorSpecialty: string;
  purpose: string;
  notes: string;
  visitDate: any;
  status: 'tamamlandi' | 'beklemede' | 'iptal';
  createdAt: any;
}

export default function VisitHistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const visitsQuery = query(
        collection(db, 'visits'),
        where('userId', '==', user?.uid),
        orderBy('visitDate', 'desc')
      );
      
      const querySnapshot = await getDocs(visitsQuery);
      const visitsData: Visit[] = [];
      querySnapshot.forEach((doc) => {
        visitsData.push({ id: doc.id, ...doc.data() } as Visit);
      });
      
      setVisits(visitsData);
    } catch (error) {
      console.error('Error fetching visits:', error);
      Alert.alert('Hata', 'Ziyaretler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVisits();
  };

  const handleDeleteVisit = (visitId: string, customerName: string) => {
    Alert.alert(
      'Ziyaret Sil',
      `${customerName} ziyaretini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteVisit(visitId),
        },
      ]
    );
  };

  const deleteVisit = async (visitId: string) => {
    try {
      await deleteDoc(doc(db, 'visits', visitId));
      Alert.alert('Başarılı', 'Ziyaret başarıyla silindi.');
      fetchVisits();
    } catch (error) {
      console.error('Error deleting visit:', error);
      Alert.alert('Hata', 'Ziyaret silinirken bir hata oluştu.');
    }
  };

  const addToCalendar = async (visit: Visit) => {
    try {
      const calendarEvent = CalendarService.prepareVisitEvent({
        customerName: visit.customerName,
        doctorName: visit.doctorName,
        visitDate: visit.visitDate.toDate ? visit.visitDate.toDate() : new Date(visit.visitDate),
        purpose: visit.purpose,
        notes: visit.notes,
        location: visit.customerName,
      });

      const eventId = await CalendarService.createVisitEvent(calendarEvent);
      
      if (eventId) {
        Alert.alert('Başarılı', 'Ziyaret takviminize eklendi.');
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Hata', 'Ziyaret takvime eklenirken bir hata oluştu.');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Tarih belirtilmemiş';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tamamlandi':
        return '#10b981';
      case 'beklemede':
        return '#f59e0b';
      case 'iptal':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'tamamlandi':
        return 'Tamamlandı';
      case 'beklemede':
        return 'Beklemede';
      case 'iptal':
        return 'İptal';
      default:
        return status;
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ziyaret Geçmişi</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/user/add-visit')}>
          <Text style={styles.addButtonText}>+ Yeni</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {visits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz ziyaret kaydı bulunmuyor</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/user/add-visit')}
            >
              <Text style={styles.emptyButtonText}>İlk Ziyaretini Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          visits.map((visit) => (
            <View key={visit.id} style={[styles.visitCard, shadowStyle]}>
              <View style={styles.visitHeader}>
                <View style={styles.visitInfo}>
                  <Text style={styles.customerName}>{visit.customerName}</Text>
                  <Text style={styles.visitDate}>{formatDate(visit.visitDate)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(visit.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(visit.status)}</Text>
                </View>
              </View>

              <View style={styles.visitDetails}>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>Dr. {visit.doctorName}</Text>
                  <Text style={styles.doctorSpecialty}>{visit.doctorSpecialty}</Text>
                </View>

                <View style={styles.purposeContainer}>
                  <Text style={styles.purposeLabel}>Ziyaret Amacı:</Text>
                  <Text style={styles.purposeText}>{visit.purpose}</Text>
                </View>

                {visit.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notlar:</Text>
                    <Text style={styles.notesText}>{visit.notes}</Text>
                  </View>
                )}
              </View>

              <View style={styles.visitActions}>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteVisit(visit.id, visit.customerName)}
                >
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addToCalendarButton}
                  onPress={() => addToCalendar(visit)}
                >
                  <Text style={styles.addToCalendarButtonText}>Takvime Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
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
    flex: 2,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'flex-end',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  visitDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  doctorInfo: {
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
  },
  purposeContainer: {
    marginBottom: 8,
  },
  purposeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  purposeText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notesContainer: {
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  addToCalendarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e0f7fa',
    borderWidth: 1,
    borderColor: '#b2ebf2',
    marginLeft: 10,
  },
  addToCalendarButtonText: {
    color: '#00796b',
    fontSize: 14,
    fontWeight: '500',
  },
});
