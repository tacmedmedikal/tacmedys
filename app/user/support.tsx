import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FAQItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isExpanded, onToggle }) => (
  <TouchableOpacity style={styles.faqItem} onPress={onToggle}>
    <View style={styles.faqHeader}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={[styles.faqToggle, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
        ▼
      </Text>
    </View>
    {isExpanded && (
      <Text style={styles.faqAnswer}>{answer}</Text>
    )}
  </TouchableOpacity>
);

export default function SupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    category: 'general',
  });

  const faqData = [
    {
      id: '1',
      question: 'Siparişim ne zaman teslim edilir?',
      answer: 'Siparişiniz, ödeme onayından sonra 1-3 iş günü içinde kargoya verilir. Kargo sürecinde İstanbul içi 1-2 gün, diğer şehirler için 2-5 iş günü sürmektedir.',
    },
    {
      id: '2',
      question: 'Ödeme yöntemleri nelerdir?',
      answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kullanabilirsiniz. Tüm ödemeler SSL sertifikası ile güvence altındadır.',
    },
    {
      id: '3',
      question: 'İade ve değişim koşulları nelerdir?',
      answer: 'Satın aldığınız ürünleri, teslim tarihinden itibaren 14 gün içinde iade edebilirsiniz. Ürün orijinal ambalajında ve kullanılmamış olmalıdır.',
    },
    {
      id: '4',
      question: 'Toplu sipariş indirimi var mı?',
      answer: 'Evet, toplu siparişlerde özel indirimler sunuyoruz. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.',
    },
    {
      id: '5',
      question: 'Ürün garantisi nasıl çalışır?',
      answer: 'Tüm medikal cihazlarımız üretici garantisi ile birlikte gelir. Garanti süresi ürünün türüne göre 1-3 yıl arasında değişmektedir.',
    },
  ];

  const contactMethods = [
    {
      title: 'Telefon',
      value: '+90 212 555 0123',
      icon: '📞',
      action: () => Linking.openURL('tel:+902125550123'),
    },
    {
      title: 'WhatsApp',
      value: '+90 555 123 4567',
      icon: '💬',
      action: () => Linking.openURL('https://wa.me/905551234567'),
    },
    {
      title: 'E-posta',
      value: 'destek@tacmedmedikal.com',
      icon: '✉️',
      action: () => Linking.openURL('mailto:destek@tacmedmedikal.com'),
    },
    {
      title: 'Adres',
      value: 'Atatürk Cad. No:123 Şişli/İstanbul',
      icon: '📍',
      action: () => {},
    },
  ];

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleSendMessage = () => {
    if (!supportForm.subject || !supportForm.message) {
      Alert.alert('Hata', 'Lütfen konu ve mesaj alanlarını doldurun.');
      return;
    }

    // TODO: API call to send support message
    Alert.alert(
      'Başarılı',
      'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      [
        {
          text: 'Tamam',
          onPress: () => {
            setSupportForm({
              subject: '',
              message: '',
              category: 'general',
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Destek</Text>
        <Text style={styles.subtitle}>Size nasıl yardımcı olabiliriz?</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İletişim</Text>
          <View style={styles.contactGrid}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.contactItem}
                onPress={method.action}
              >
                <Text style={styles.contactIcon}>{method.icon}</Text>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactValue}>{method.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek Talebi Oluştur</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Kategori</Text>
            <View style={styles.categoryButtons}>
              {[
                { key: 'general', label: 'Genel' },
                { key: 'order', label: 'Sipariş' },
                { key: 'product', label: 'Ürün' },
                { key: 'technical', label: 'Teknik' },
              ].map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    supportForm.category === category.key && styles.categoryButtonActive
                  ]}
                  onPress={() => setSupportForm({...supportForm, category: category.key})}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    supportForm.category === category.key && styles.categoryButtonTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Konu</Text>
            <TextInput
              style={styles.fieldInput}
              value={supportForm.subject}
              onChangeText={(text) => setSupportForm({...supportForm, subject: text})}
              placeholder="Konuyu kısaca açıklayın"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mesaj</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMultiline]}
              value={supportForm.message}
              onChangeText={(text) => setSupportForm({...supportForm, message: text})}
              placeholder="Detaylı açıklama yazın..."
              multiline
              numberOfLines={5}
            />
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Mesaj Gönder</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          {faqData.map((faq) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isExpanded={expandedFAQ === faq.id}
              onToggle={() => handleFAQToggle(faq.id)}
            />
          ))}
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çalışma Saatleri</Text>
          <View style={styles.workingHours}>
            <View style={styles.workingHourItem}>
              <Text style={styles.workingDay}>Pazartesi - Cuma</Text>
              <Text style={styles.workingTime}>09:00 - 18:00</Text>
            </View>
            <View style={styles.workingHourItem}>
              <Text style={styles.workingDay}>Cumartesi</Text>
              <Text style={styles.workingTime}>09:00 - 14:00</Text>
            </View>
            <View style={styles.workingHourItem}>
              <Text style={styles.workingDay}>Pazar</Text>
              <Text style={styles.workingTime}>Kapalı</Text>
            </View>
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
    padding: 20,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: 'white',
  },
  fieldInputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 16,
  },
  faqToggle: {
    fontSize: 12,
    color: '#64748b',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    lineHeight: 20,
  },
  workingHours: {
    gap: 12,
  },
  workingHourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  workingDay: {
    fontSize: 16,
    color: '#1e293b',
  },
  workingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});
