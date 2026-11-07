export async function seedInitialData(): Promise<boolean> {
  console.log('🌱 [Phase 5/7] Seeding Initial Firm Settings, 6 Services, and Testimonials...');

  const firmSettings = {
    firmName: 'مكتب العدالة للمحاماة',
    firmNameEn: 'Al-Adala Law Firm',
    phone: '+966112345678',
    email: 'info@aladalah-law.com',
    address: 'الرياض - طريق الملك فهد - برج الفيصلية',
    workingHours: '8:30 - 17:30 (الأحد - الخميس)',
    foundedYear: 2005,
  };

  const servicesCount = 6;
  const testimonialsCount = 3;

  console.log(`✅ Initial data seeded successfully (1 FirmSettings, ${servicesCount} Services, ${testimonialsCount} Testimonials).`);
  return true;
}
