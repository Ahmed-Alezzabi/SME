/**
 * Tripoli Business Center Training Management System - Types
 * مركز أعمال طرابلس - البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة
 */

export type UserRole = 'admin' | 'trainer' | 'registrar' | 'certificates' | 'readonly';

export interface TrainingProgram {
  id: string; // Dynamic ID, e.g. "PRG-2026-001"
  programNumber: string; // رقم البرنامج
  name: string; // اسم البرنامج
  type: string; // نوع البرنامج (حضورى، عن بعد، هجين)
  startDate: string; // تاريخ البداية
  endDate: string; // تاريخ النهاية
  days: number; // عدد الأيام
  hours: number; // عدد الساعات
  location: string; // مكان التنفيذ
  city: string; // المدينة
  trainer: string; // المدرب
  organization: string; // الجهة المنفذة
  targetGroup: string; // الفئة المستهدفة
  maxParticipants: number; // الحد الأقصى للمشاركين
  status: 'planning' | 'active' | 'completed' | 'archived'; // حالة البرنامج
  notes?: string; // ملاحظات
  createdAt?: string;
}

export interface Participant {
  id: string; // الرقم التسلسلي
  name: string; // الاسم الرباعي
  nationalId: string; // الرقم الوطني
  birthDate: string; // تاريخ الميلاد
  gender: 'male' | 'female'; // الجنس
  education: string; // المؤهل العلمي
  specialization: string; // التخصص
  jobTitle: string; // الوظيفة
  employer: string; // جهة العمل
  city: string; // المدينة
  phone: string; // رقم الهاتف
  email: string; // البريد الإلكتروني
  programId: string; // البرنامج المسجل به
  attendanceStatus: 'present' | 'absent' | 'excused' | 'pending'; // حالة الحضور
  attendanceRate: number; // نسبة الحضور %
  evaluation: number; // نتيجة التقييم %
  passStatus: 'passed' | 'failed' | 'pending'; // حالة الاجتياز
  notes?: string; // ملاحظات
  certificateId?: string | null; // رقم الشهادة
  certificateDate?: string | null; // تاريخ الإصدار
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  category: 'programs' | 'participants' | 'certificates' | 'system' | 'import' | 'backup';
  details: string;
}

export interface SystemStats {
  totalPrograms: number;
  totalParticipants: number;
  totalGraduates: number;
  totalCertificates: number;
}
