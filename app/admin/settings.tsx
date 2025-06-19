import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  type: 'toggle' | 'select' | 'action';
  isEnabled?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  title, 
  subtitle, 
  value, 
  type, 
  isEnabled = false,
  onPress, 
  onToggle 
}) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={type === 'action' ? onPress : undefined}
    disabled={type === 'toggle'}
  >
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    
    {type === 'toggle' && (
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
        thumbColor={isEnabled ? '#ffffff' : '#ffffff'}
      />
    )}
    
    {type === 'select' && (
      <View style={styles.settingValue}>
        <Text style={styles.settingValueText}>{value}</Text>
        <Text style={styles.settingArrow}>›</Text>
      </View>
    )}
    
    {type === 'action' && (
      <Text style={styles.settingArrow}>›</Text>
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  const handleExportData = () => {
    console.log('Export data');
  };

  const handleImportData = () => {
    console.log('Import data');
  };

  const handleUserManagement = () => {
    console.log('User management settings');
  };

  const handleSecurity = () => {
    console.log('Security settings');
  };

  const handleBackup = () => {
    console.log('Backup settings');
  };

  const handleSystemLogs = () => {
    console.log('System logs');
  };

  const handleClearCache = () => {
    console.log('Clear cache');
  };

  const handleResetSettings = () => {
    console.log('Reset settings');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ayarlar</Text>
        <Text style={styles.subtitle}>Sistem ve uygulama ayarları</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel Ayarlar</Text>
          
          <SettingItem
            title="Bildirimler"
            subtitle="Sistem bildirimleri ve uyarılar"
            type="toggle"
            isEnabled={notifications}
            onToggle={setNotifications}
          />
          
          <SettingItem
            title="E-posta Uyarıları"
            subtitle="Önemli olaylar için e-posta gönder"
            type="toggle"
            isEnabled={emailAlerts}
            onToggle={setEmailAlerts}
          />
          
          <SettingItem
            title="Dil"
            subtitle="Uygulama dili"
            type="select"
            value="Türkçe"
            onPress={() => console.log('Language settings')}
          />
          
          <SettingItem
            title="Zaman Dilimi"
            subtitle="Tarih ve saat formatı"
            type="select"
            value="GMT+3 (İstanbul)"
            onPress={() => console.log('Timezone settings')}
          />
        </View>

        {/* System Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistem Ayarları</Text>
          
          <SettingItem
            title="Otomatik Yedekleme"
            subtitle="Günlük veri yedeklemesi"
            type="toggle"
            isEnabled={autoBackup}
            onToggle={setAutoBackup}
          />
          
          <SettingItem
            title="Bakım Modu"
            subtitle="Sistem bakımı için kullanıcı erişimini kısıtla"
            type="toggle"
            isEnabled={maintenance}
            onToggle={setMaintenance}
          />
          
          <SettingItem
            title="Kullanıcı Yönetimi"
            subtitle="Kullanıcı rolleri ve izinleri"
            type="action"
            onPress={handleUserManagement}
          />
          
          <SettingItem
            title="Güvenlik"
            subtitle="Güvenlik politikaları ve erişim kontrolleri"
            type="action"
            onPress={handleSecurity}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
          
          <SettingItem
            title="Yedekleme ve Geri Yükleme"
            subtitle="Veri yedekleme ayarları"
            type="action"
            onPress={handleBackup}
          />
          
          <SettingItem
            title="Verileri Dışa Aktar"
            subtitle="Sistem verilerini CSV/Excel formatında indir"
            type="action"
            onPress={handleExportData}
          />
          
          <SettingItem
            title="Verileri İçe Aktar"
            subtitle="Toplu veri içe aktarma"
            type="action"
            onPress={handleImportData}
          />
        </View>

        {/* Maintenance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bakım ve Destek</Text>
          
          <SettingItem
            title="Sistem Logları"
            subtitle="Hata kayıtları ve sistem logları"
            type="action"
            onPress={handleSystemLogs}
          />
          
          <SettingItem
            title="Önbelleği Temizle"
            subtitle="Geçici dosyaları ve önbelleği temizle"
            type="action"
            onPress={handleClearCache}
          />
          
          <SettingItem
            title="Ayarları Sıfırla"
            subtitle="Tüm ayarları varsayılan değerlere döndür"
            type="action"
            onPress={handleResetSettings}
          />
        </View>

        {/* System Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistem Bilgisi</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Uygulama Sürümü</Text>
            <Text style={styles.infoValue}>v1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Son Güncelleme</Text>
            <Text style={styles.infoValue}>15.06.2025</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Veritabanı Sürümü</Text>
            <Text style={styles.infoValue}>PostgreSQL 15.2</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Son Yedekleme</Text>
            <Text style={styles.infoValue}>14.06.2025 23:30</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
});
