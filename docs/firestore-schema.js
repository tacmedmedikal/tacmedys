// Firestore Collections Structure for Medical Visit Tracking

/*
1. customers (Müşteriler - Hastaneler/Klinikler)
{
  id: string,
  name: string,
  type: 'hastane' | 'ozel_hastane' | 'ozel_klinik' | 'poliklinik',
  address: string,
  city: string,
  phone: string,
  email: string,
  contactPerson: string, // Ana iletişim kişisi
  status: 'active' | 'inactive',
  createdAt: timestamp,
  createdBy: string, // user id
  notes: string
}

2. doctors (Doktorlar)
{
  id: string,
  name: string,
  title: string, // Dr., Prof. Dr., Doç. Dr.
  specialty: string, // Uzmanlık alanı
  phone: string,
  email: string,
  customerId: string, // Hangi hastane/klinikte çalışıyor
  status: 'active' | 'inactive',
  createdAt: timestamp,
  notes: string
}

3. visits (Ziyaretler)
{
  id: string,
  userId: string, // Ziyareti yapan kullanıcı
  customerId: string,
  doctorId: string,
  visitDate: timestamp,
  visitType: 'planlanan' | 'ani' | 'takip',
  duration: number, // dakika
  purpose: string, // Ziyaret amacı
  products: [
    {
      productName: string,
      quantity: number,
      presented: boolean, // Tanıtıldı mı?
      interest: 'yuksek' | 'orta' | 'dusuk' | 'yok'
    }
  ],
  outcome: string, // Görüşme sonucu
  nextVisitDate: timestamp, // Sonraki ziyaret tarihi
  status: 'tamamlandi' | 'iptal' | 'ertelendi',
  createdAt: timestamp,
  updatedAt: timestamp,
  coordinates: {
    latitude: number,
    longitude: number
  },
  photos: string[], // Fotoğraf URL'leri
  notes: string
}

4. products (Ürünler)
{
  id: string,
  name: string,
  category: string,
  description: string,
  price: number,
  isActive: boolean,
  createdAt: timestamp
}

5. reports (Raporlar)
{
  id: string,
  userId: string,
  period: string, // 'daily', 'weekly', 'monthly'
  startDate: timestamp,
  endDate: timestamp,
  totalVisits: number,
  completedVisits: number,
  totalCustomers: number,
  totalDoctors: number,
  createdAt: timestamp
}
*/
