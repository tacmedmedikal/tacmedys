import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  alarms?: Array<{ relativeOffset: number; method: Calendar.AlarmMethod }>;
}

class CalendarService {
  private defaultCalendarId: string | null = null;

  // Takvim izinlerini kontrol et ve iste
  async requestCalendarPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Calendar.getCalendarPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'İzin Gerekli',
            'Takvim entegrasyonu için takvim erişim izni gereklidir. Lütfen uygulama ayarlarından izin verin.',
            [{ text: 'Tamam' }]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Calendar permission error:', error);
      return false;
    }
  }

  // Varsayılan takvimi bul veya oluştur
  async getOrCreateDefaultCalendar(): Promise<string | null> {
    try {
      if (this.defaultCalendarId) {
        return this.defaultCalendarId;
      }      // Kaydedilmiş takvim ID'sini kontrol et
      const savedCalendarId = await AsyncStorage.getItem('tacmed_calendar_id');
      if (savedCalendarId) {
        try {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const calendar = calendars.find(cal => cal.id === savedCalendarId);
          if (calendar) {
            this.defaultCalendarId = savedCalendarId;
            return savedCalendarId;
          }
        } catch (error) {
          // Takvim bulunamadı, yeni oluştur
          await AsyncStorage.removeItem('tacmed_calendar_id');
        }
      }

      // Mevcut takvimleri kontrol et
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // TacMed takvimini ara
      let tacmedCalendar = calendars.find(cal => 
        cal.title === 'TacMed Ziyaretler' && cal.allowsModifications
      );

      if (!tacmedCalendar) {
        // Yeni takvim oluştur
        if (Platform.OS === 'ios') {
          // iOS için varsayılan source'u bul
          const defaultSource = calendars.find(cal => 
            cal.source && cal.source.name === 'Default' && 
            cal.source.type === Calendar.SourceType.LOCAL
          )?.source;

          if (!defaultSource) {
            throw new Error('Varsayılan takvim kaynağı bulunamadı');
          }

          tacmedCalendar = {
            id: await Calendar.createCalendarAsync({
              title: 'TacMed Ziyaretler',
              color: '#3b82f6',
              entityType: Calendar.EntityTypes.EVENT,
              sourceId: defaultSource.id,
              source: defaultSource,
              name: 'TacMed Ziyaretler',
              ownerAccount: 'personal',
              accessLevel: Calendar.CalendarAccessLevel.OWNER,
            }),
          } as Calendar.Calendar;
        } else {
          // Android için
          tacmedCalendar = {
            id: await Calendar.createCalendarAsync({
              title: 'TacMed Ziyaretler',
              color: '#3b82f6',
              entityType: Calendar.EntityTypes.EVENT,
              name: 'TacMed Ziyaretler',
              ownerAccount: 'personal',
              accessLevel: Calendar.CalendarAccessLevel.OWNER,
            }),
          } as Calendar.Calendar;
        }
      }

      this.defaultCalendarId = tacmedCalendar.id;
      await AsyncStorage.setItem('tacmed_calendar_id', tacmedCalendar.id);
      
      return tacmedCalendar.id;
    } catch (error) {
      console.error('Error getting/creating calendar:', error);
      Alert.alert('Hata', 'Takvim oluşturulurken bir hata oluştu.');
      return null;
    }
  }

  // Ziyaret etkinliği oluştur
  async createVisitEvent(event: CalendarEvent): Promise<string | null> {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) return null;

      const calendarId = await this.getOrCreateDefaultCalendar();
      if (!calendarId) return null;      const eventDetails = {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        timeZone: 'Europe/Istanbul',
        location: event.location || null,
        notes: event.notes || '',
        alarms: event.alarms || [
          { relativeOffset: -60, method: Calendar.AlarmMethod.ALERT }, // 1 saat öncesi
          { relativeOffset: -15, method: Calendar.AlarmMethod.ALERT }, // 15 dakika öncesi
        ],
      };

      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
      return eventId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      Alert.alert('Hata', 'Takvim etkinliği oluşturulurken bir hata oluştu.');
      return null;
    }
  }

  // Etkinliği güncelle
  async updateVisitEvent(eventId: string, event: CalendarEvent): Promise<boolean> {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) return false;

      const eventDetails: Partial<Calendar.Event> = {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        notes: event.notes,
        alarms: event.alarms || [
          { relativeOffset: -60, method: Calendar.AlarmMethod.ALERT },
          { relativeOffset: -15, method: Calendar.AlarmMethod.ALERT },
        ],
      };

      await Calendar.updateEventAsync(eventId, eventDetails);
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      Alert.alert('Hata', 'Takvim etkinliği güncellenirken bir hata oluştu.');
      return false;
    }
  }

  // Etkinliği sil
  async deleteVisitEvent(eventId: string): Promise<boolean> {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) return false;

      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      Alert.alert('Hata', 'Takvim etkinliği silinirken bir hata oluştu.');
      return false;
    }
  }

  // Kullanıcının takvim tercihlerini al
  async getUserCalendarPreference(): Promise<boolean> {
    try {
      const preference = await AsyncStorage.getItem('calendar_sync_enabled');
      return preference === 'true';
    } catch (error) {
      return false;
    }
  }

  // Kullanıcının takvim tercihini kaydet
  async setUserCalendarPreference(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('calendar_sync_enabled', enabled.toString());
    } catch (error) {
      console.error('Error saving calendar preference:', error);
    }
  }

  // Ziyaret için takvim etkinliği detaylarını hazırla
  prepareVisitEvent(visit: {
    customerName: string;
    doctorName: string;
    visitDate: Date;
    purpose: string;
    notes?: string;
    location?: string;
  }): CalendarEvent {
    const startDate = new Date(visit.visitDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 saat süre

    return {
      title: `Ziyaret: ${visit.customerName}`,
      startDate,
      endDate,
      location: visit.location || visit.customerName,
      notes: `Doktor: Dr. ${visit.doctorName}\nAmaç: ${visit.purpose}${visit.notes ? '\n\nNotlar: ' + visit.notes : ''}`,
      alarms: [
        { relativeOffset: -60, method: Calendar.AlarmMethod.ALERT }, // 1 saat öncesi
        { relativeOffset: -15, method: Calendar.AlarmMethod.ALERT }, // 15 dakika öncesi
      ],
    };
  }
}

export default new CalendarService();
