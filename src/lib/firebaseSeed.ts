import { db } from './firebase';
import { collection, doc, setDoc, getDocs, limit, query } from 'firebase/firestore';

export async function seedFirestoreInitialCollections() {
  try {
    // Check if initial users collection has records
    const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
    if (!usersSnap.empty) {
      console.log('Firestore collections are already initialized.');
      return;
    }

    console.log('Seeding initial Firestore database collections...');

    const safeSetDoc = async (colName: string, docId: string, data: any) => {
      try {
        await setDoc(doc(db, colName, docId), data, { merge: true });
      } catch (e) {
        console.warn(`Firestore seed info (${colName}/${docId}):`, e);
      }
    };

    // 1. Users Collection
    const initialUsers = [
      { id: 'usr-admin', uid: 'usr-admin', name: 'أ. عبد العزيز المقرن', email: 'admin@aladalah-law.sa', role: 'admin', phone: '+966501234567', status: 'active', createdAt: new Date().toISOString() },
      { id: 'usr-lawyer', uid: 'usr-lawyer', name: 'د. خالد المنصور', email: 'khaled@aladalah-law.sa', role: 'lawyer', phone: '+966507654321', status: 'active', createdAt: new Date().toISOString() },
      { id: 'usr-assistant', uid: 'usr-assistant', name: 'أ. سارة العتيبي', email: 'sara@aladalah-law.sa', role: 'legal_assistant', phone: '+966509876543', status: 'active', createdAt: new Date().toISOString() },
      { id: 'usr-accountant', uid: 'usr-accountant', name: 'أ. محمد الدوسري', email: 'mohammed@aladalah-law.sa', role: 'accountant', phone: '+966503332211', status: 'active', createdAt: new Date().toISOString() },
      { id: 'usr-secretary', uid: 'usr-secretary', name: 'أ. نورة الشمري', email: 'noura@aladalah-law.sa', role: 'secretary', phone: '+966504445566', status: 'active', createdAt: new Date().toISOString() },
      { id: 'usr-client-1', uid: 'usr-client-1', name: 'شركة الأفق للاستثمار', email: 'contact@alofoq.sa', role: 'client', phone: '+966112223333', status: 'active', createdAt: new Date().toISOString() }
    ];

    for (const u of initialUsers) {
      await safeSetDoc('users', u.id, u);
    }

    // 2. Cases Collection
    const initialCases = [
      { id: 'case-101', caseNumber: 'CAS-2024-001', title: 'قضية نزاع تجاري — شركة الأفق ضد شركة المدار', clientName: 'شركة الأفق للاستثمار', clientId: 'usr-client-1', lawyerId: 'usr-lawyer', courtName: 'المحكمة التجارية بالرياض', status: 'active', progress: 65, nextHearingDate: '2024-11-20', createdAt: new Date().toISOString() },
      { id: 'case-102', caseNumber: 'CAS-2024-002', title: 'دعوى عمالية — تعويض نهاية الخدمة', clientName: 'سعود الفايز', clientId: 'usr-client-2', lawyerId: 'usr-lawyer', courtName: 'المحكمة العمالية بجدة', status: 'active', progress: 40, nextHearingDate: '2024-11-25', createdAt: new Date().toISOString() },
      { id: 'case-103', caseNumber: 'CAS-2024-003', title: 'تحكيم عقاري — مجمع الزمرد التجاري', clientName: 'مجموعة البناء الوطنية', clientId: 'usr-client-3', lawyerId: 'usr-admin', courtName: 'مركز التحكيم التجاري السعودي', status: 'pending', progress: 20, nextHearingDate: '2024-12-05', createdAt: new Date().toISOString() }
    ];

    for (const c of initialCases) {
      await safeSetDoc('cases', c.id, c);
    }

    // 3. Clients Collection
    const initialClients = [
      { id: 'usr-client-1', name: 'شركة الأفق للاستثمار', type: 'corporate', nationalIdOrCr: '1010987654', phone: '+966112223333', email: 'contact@alofoq.sa', activeCasesCount: 2, status: 'active', createdAt: new Date().toISOString() },
      { id: 'usr-client-2', name: 'سعود بن عبد الله الفايز', type: 'individual', nationalIdOrCr: '1087654321', phone: '+966551122334', email: 'saud@example.sa', activeCasesCount: 1, status: 'active', createdAt: new Date().toISOString() }
    ];

    for (const cl of initialClients) {
      await safeSetDoc('clients', cl.id, cl);
    }

    // 4. Invoices Collection
    const initialInvoices = [
      { id: 'inv-2001', invoiceNumber: 'INV-2024-089', clientName: 'شركة الأفق للاستثمار', clientId: 'usr-client-1', caseId: 'case-101', amount: 45000, vatAmount: 6750, totalAmount: 51750, status: 'pending', issueDate: '2024-11-01', dueDate: '2024-11-30' },
      { id: 'inv-2002', invoiceNumber: 'INV-2024-075', clientName: 'سعود الفايز', clientId: 'usr-client-2', caseId: 'case-102', amount: 15000, vatAmount: 2250, totalAmount: 17250, status: 'paid', issueDate: '2024-10-15', dueDate: '2024-10-30', paidAt: '2024-10-28' }
    ];

    for (const inv of initialInvoices) {
      await safeSetDoc('invoices', inv.id, inv);
    }

    // 5. Appointments Collection
    const initialAppointments = [
      { id: 'app-301', title: 'جلسة الترافع الثانية — المحكمة التجارية', type: 'hearing', date: '2024-11-20', time: '10:00 ص', location: 'المحكمة التجارية — القاعة 4', lawyerId: 'usr-lawyer', clientId: 'usr-client-1', caseId: 'case-101', status: 'confirmed' },
      { id: 'app-302', title: 'اجتماع مراجعة مستندات التحكيم', type: 'consultation', date: '2024-11-22', time: '01:30 م', location: 'مكتب المحاماة — قاعة الاجتماعات الرئيسية', lawyerId: 'usr-admin', clientId: 'usr-client-3', caseId: 'case-103', status: 'confirmed' }
    ];

    for (const appt of initialAppointments) {
      await safeSetDoc('appointments', appt.id, appt);
    }

    console.log('Firestore seed completed successfully.');
  } catch (error) {
    console.warn('Firestore seed check completed with note:', error);
  }
}
