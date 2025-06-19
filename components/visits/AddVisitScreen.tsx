import { useRouter } from 'expo-router';
import {
    Timestamp,
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebaseConfig';
import CalendarService from '../../utils/calendarService';

interface Customer {
  id: string;
  name: string;
  type: string;
  address: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  customerId: string;
}

export default function AddVisitScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [visitDate, setVisitDate] = useState(new Date());
  
  // Takvim entegrasyonu state'leri
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchDoctors();
    loadCalendarPreference();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      const customerDoctors = doctors.filter(doc => doc.customerId === selectedCustomer.id);
      setFilteredDoctors(customerDoctors);
      setSelectedDoctor(null); // Reset doctor selection when customer changes
    }
  }, [selectedCustomer, doctors]);

  const fetchCustomers = async () => {
    try {
      const customersQuery = query(
        collection(db, 'customers'),
        where('userId', '==', user?.uid),
        orderBy('name')
      );
      const snapshot = await getDocs(customersQuery);
      const customersList: Customer[] = [];
      snapshot.forEach(doc => {
        customersList.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const doctorsQuery = query(
        collection(db, 'doctors'),
        where('userId', '==', user?.uid),
        orderBy('name')
      );
      const snapshot = await getDocs(doctorsQuery);
      const doctorsList: Doctor[] = [];
      snapshot.forEach(doc => {
        doctorsList.push({ id: doc.id, ...doc.data() } as Doctor);
      });
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedDoctor || !purpose.trim()) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'visits'), {
        userId: user?.uid,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        purpose: purpose.trim(),
        notes: notes.trim(),
        visitDate: Timestamp.fromDate(visitDate),
        status: 'tamamlandi',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Takvime kaydetme
      await saveToCalendar({
        customerName: selectedCustomer.name,
        doctorName: selectedDoctor.name,
        visitDate: visitDate,
        purpose: purpose,
        notes: notes,
        location: selectedCustomer.address || selectedCustomer.name,
      });

      Alert.alert('Başarılı', 'Ziyaret kaydı başarıyla eklendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding visit:', error);
      Alert.alert('Hata', 'Ziyaret kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarPreference = async () => {
    try {
      const preference = await CalendarService.getUserCalendarPreference();
      setCalendarSyncEnabled(preference);
      setAddToCalendar(preference);
    } catch (error) {
      console.error('Error loading calendar preference:', error);
    }
  };

  const saveToCalendar = async (visitData: any) => {
    if (!addToCalendar || !selectedCustomer || !selectedDoctor) return null;

    try {
      const calendarEvent = CalendarService.prepareVisitEvent({
        customerName: selectedCustomer.name,
        doctorName: selectedDoctor.name,
        visitDate: visitDate,
        purpose: purpose,
        notes: notes,
        location: selectedCustomer.address || selectedCustomer.name,
      });

      const eventId = await CalendarService.createVisitEvent(calendarEvent);
      return eventId;
    } catch (error) {
      console.error('Error saving to calendar:', error);
      Alert.alert('Uyarı', 'Ziyaret kaydedildi ancak takvime eklenirken bir hata oluştu.');
      return null;
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Yeni Ziyaret Ekle</Text>
      </View>

      <View style={styles.form}>
        {/* Customer Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Müşteri Seçin *</Text>
          <TouchableOpacity 
            style={[styles.selectButton, shadowStyle]}
            onPress={() => setCustomerModalVisible(true)}
          >
            <Text style={selectedCustomer ? styles.selectedText : styles.placeholderText}>
              {selectedCustomer ? selectedCustomer.name : 'Hastane/Klinik seçin'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Doctor Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Doktor Seçin *</Text>
          <TouchableOpacity 
            style={[styles.selectButton, shadowStyle, !selectedCustomer && styles.disabledButton]}
            onPress={() => selectedCustomer && setDoctorModalVisible(true)}
            disabled={!selectedCustomer}
          >
            <Text style={selectedDoctor ? styles.selectedText : styles.placeholderText}>
              {selectedDoctor ? `${selectedDoctor.name} (${selectedDoctor.specialty})` : 'Önce müşteri seçin'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Purpose */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ziyaret Amacı *</Text>
          <TextInput
            style={[styles.textInput, shadowStyle]}
            value={purpose}
            onChangeText={setPurpose}
            placeholder="Örn: Ürün tanıtımı, sipariş takibi..."
            multiline
          />
        </View>

        {/* Notes */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notlar</Text>
          <TextInput
            style={[styles.textArea, shadowStyle]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ziyaretle ilgili detaylar, sonuçlar..."
            multiline
            numberOfLines={4}
          />        </View>

        {/* Calendar Integration */}
        <View style={styles.inputContainer}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarTextContainer}>
              <Text style={styles.label}>Takvime Ekle</Text>
              <Text style={styles.calendarDescription}>
                Ziyaret tarihini Google Takvim'e otomatik ekle
              </Text>
            </View>
            <Switch
              value={addToCalendar}
              onValueChange={(value) => {
                setAddToCalendar(value);
                CalendarService.setUserCalendarPreference(value);
              }}
              trackColor={{ false: '#f1f5f9', true: '#3b82f6' }}
              thumbColor={addToCalendar ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Kaydediliyor...' : 'Ziyaret Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer Selection Modal */}
      <Modal
        visible={customerModalVisible}
        animationType="slide"
        onRequestClose={() => setCustomerModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Müşteri Seçin</Text>
            <TouchableOpacity onPress={() => setCustomerModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {customers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCustomer(customer);
                  setCustomerModalVisible(false);
                }}
              >
                <Text style={styles.modalItemTitle}>{customer.name}</Text>
                <Text style={styles.modalItemSubtitle}>{customer.type}</Text>
              </TouchableOpacity>
            ))}
            {customers.length === 0 && (
              <Text style={styles.emptyText}>Henüz müşteri eklenmemiş</Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Doctor Selection Modal */}
      <Modal
        visible={doctorModalVisible}
        animationType="slide"
        onRequestClose={() => setDoctorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Doktor Seçin</Text>
            <TouchableOpacity onPress={() => setDoctorModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {filteredDoctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedDoctor(doctor);
                  setDoctorModalVisible(false);
                }}
              >
                <Text style={styles.modalItemTitle}>{doctor.name}</Text>
                <Text style={styles.modalItemSubtitle}>{doctor.specialty}</Text>
              </TouchableOpacity>
            ))}
            {filteredDoctors.length === 0 && (
              <Text style={styles.emptyText}>Bu müşteri için doktor eklenmemiş</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    color: '#1f2937',
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    color: '#6b7280',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#1f2937',
    minHeight: 50,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 50,
  },
  calendarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calendarTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  calendarDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
});
