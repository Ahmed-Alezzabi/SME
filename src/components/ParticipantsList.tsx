import React, { useState } from "react";
import { Participant, TrainingProgram } from "../types";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus, 
  Download, 
  UploadCloud, 
  Check, 
  X, 
  ChevronDown, 
  MapPin, 
  Phone, 
  Mail, 
  BookOpen, 
  AlertTriangle,
  Award,
  CheckCircle,
  FileCheck2,
  Settings
} from "lucide-react";

interface ParticipantsListProps {
  participants: Participant[];
  programs: TrainingProgram[];
  userRole: string;
  onAddParticipant: (participant: Omit<Participant, "id">) => void;
  onUpdateParticipant: (id: string, participant: Partial<Participant>) => void;
  onDeleteParticipant: (id: string) => void;
  onBatchImport: (list: any[], resolution: "merge" | "ignore" | "overwrite") => void;
}

export default function ParticipantsList({
  participants,
  programs,
  userRole,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
  onBatchImport
}: ParticipantsListProps) {
  
  // Search and Advanced Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [passFilter, setPassFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // Modals controller
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Participant | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form parameters
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<'male' | 'female'>("male");
  const [education, setEducation] = useState("بكالوريوس");
  const [specialization, setSpecialization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [city, setCity] = useState("طرابلس");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [programId, setProgramId] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'excused' | 'pending'>("pending");
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [evaluation, setEvaluation] = useState(0);
  const [passStatus, setPassStatus] = useState<'passed' | 'failed' | 'pending'>("pending");
  const [notes, setNotes] = useState("");
  
  // Batch Import parameter states
  const [rawText, setRawText] = useState("");
  const [importResolution, setImportResolution] = useState<"merge" | "ignore" | "overwrite">("overwrite");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const resetForm = () => {
    setName("");
    setNationalId("");
    setBirthDate("");
    setGender("male");
    setEducation("بكالوريوس");
    setSpecialization("");
    setJobTitle("");
    setEmployer("");
    setCity("طرابلس");
    setPhone("");
    setEmail("");
    setProgramId(programs[0]?.id || "");
    setAttendanceStatus("pending");
    setAttendanceRate(0);
    setEvaluation(0);
    setPassStatus("pending");
    setNotes("");
    setEditingPart(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Participant) => {
    setEditingPart(p);
    setName(p.name);
    setNationalId(p.nationalId);
    setBirthDate(p.birthDate ? p.birthDate.split('T')[0] : "");
    setGender(p.gender);
    setEducation(p.education);
    setSpecialization(p.specialization);
    setJobTitle(p.jobTitle);
    setEmployer(p.employer);
    setCity(p.city);
    setPhone(p.phone);
    setEmail(p.email);
    setProgramId(p.programId || (programs[0]?.id || ""));
    setAttendanceStatus(p.attendanceStatus);
    setAttendanceRate(p.attendanceRate);
    setEvaluation(p.evaluation);
    setPassStatus(p.passStatus);
    setNotes(p.notes || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId) {
      alert("الرجاء اختيار برنامج متاح معتمد أولاً.");
      return;
    }

    const data = {
      name,
      nationalId,
      birthDate,
      gender,
      education,
      specialization,
      jobTitle,
      employer,
      city,
      phone,
      email,
      programId,
      attendanceStatus,
      attendanceRate: Number(attendanceRate),
      evaluation: Number(evaluation),
      passStatus,
      notes
    };

    if (editingPart) {
      onUpdateParticipant(editingPart.id, data);
    } else {
      onAddParticipant(data);
    }
    setIsFormOpen(false);
    resetForm();
  };

  // Smart Parser for pasting copied values from Google Sheets / Excel
  const handleParseImport = () => {
    if (!rawText.trim()) {
      setImportErrors(["يرجى إدخال نص البيانات المنسوخة أولاً"]);
      return;
    }

    const lines = rawText.trim().split("\n");
    const parsedData: any[] = [];
    const errors: string[] = [];

    // Parse loop, assuming header format or fallback to Tab-delimited
    lines.forEach((line, idx) => {
      // split by tabs or commas
      const cols = line.split(/\t|,/);
      if (cols.length < 3) return; // skip garbage lines

      // Skip common Excel header lines if any
      if (line.includes("الاسم") || line.includes("الوطني") || line.includes("الإلكتروني")) {
        return;
      }

      // Fields: Name, NationalId, Phone, Email, City, Job, Employer, Education, Specialization
      const parsedName = cols[0]?.trim();
      const parsedNatId = cols[1]?.trim();
      const parsedPhone = cols[2]?.trim() || "0910000000";
      const parsedEmail = cols[3]?.trim() || "unspecified@sme.gov.ly";
      const parsedCity = cols[4]?.trim() || "طرابلس";
      const parsedJob = cols[5]?.trim() || "صاحب مشروع";
      const parsedEmp = cols[6]?.trim() || "عمل حر";
      const parsedEdu = cols[7]?.trim() || "بكالوريوس";
      const parsedSpec = cols[8]?.trim() || "إدارة أعمال";

      if (!parsedName || !parsedNatId) {
        errors.push(`السطر رقم ${idx + 1}: الاسم أو الرقم الوطني فارغ.`);
        return;
      }

      if (parsedNatId.length < 11 || isNaN(Number(parsedNatId))) {
        errors.push(`السطر رقم ${idx + 1}: الرقم الوطني غريب أو غير صحيح (${parsedNatId})`);
      }

      // Find first matching program or fallback code
      const targetProg = programs[0] || { id: "PRG-2026-001" };

      parsedData.push({
        name: parsedName,
        nationalId: parsedNatId,
        phone: parsedPhone,
        email: parsedEmail,
        city: parsedCity,
        jobTitle: parsedJob,
        employer: parsedEmp,
        education: parsedEdu,
        specialization: parsedSpec,
        birthDate: "1995-01-01",
        gender: "male",
        programId: targetProg.id,
        attendanceStatus: "present",
        attendanceRate: 100,
        evaluation: 85,
        passStatus: "passed",
        notes: "تم تسجيل العضو آلياً عبر نظام الاستيراد الذكي."
      });
    });

    setImportPreview(parsedData);
    setImportErrors(errors);
  };

  const triggerBatchImport = () => {
    if (importPreview.length === 0) return;
    onBatchImport(importPreview, importResolution);
    setIsImportOpen(false);
    setImportPreview([]);
    setRawText("");
  };

  // CSV Generator for browser Excel export
  const exportToCSV = () => {
    const headers = [
      "الرقم التسلسلي",
      "الاسم الرباعي",
      "الرقم الوطني",
      "المدينة",
      "رقم الهاتف",
      "البريد الإلكتروني",
      "البرنامج المسجل به",
      "حضور/غياب",
      "نسبة الحضور %",
      "نتيجة التقييم %",
      "حالة الاجتياز",
      "رقم الشهادة"
    ];

    const rows = filteredParticipants.map(p => {
      const prog = programs.find(pr => pr.id === p.programId);
      return [
        p.id,
        p.name,
        `"${p.nationalId}"`, // secure double quotes representing big integers
        p.city,
        p.phone,
        p.email,
        prog ? prog.name : "غير معروف",
        p.attendanceStatus,
        p.attendanceRate,
        p.evaluation,
        p.passStatus,
        p.certificateId || "بلا شهادة"
      ];
    });

    // Arabic CSV encoding support using UTF-8 BOM
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_مشاركي_مركز_طرابلس_المسجلين.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtration logic
  const filteredParticipants = participants.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nationalId.includes(searchTerm) ||
      p.phone.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchProg = programFilter ? p.programId === programFilter : true;
    const matchPass = passFilter ? p.passStatus === passFilter : true;
    const matchCity = cityFilter ? p.city === cityFilter : true;

    return matchSearch && matchProg && matchPass && matchCity;
  });

  const uniqueCities = Array.from(new Set(participants.map(p => p.city).filter(Boolean)));
  const canEdit = userRole === 'admin' || userRole === 'registrar';

  return (
    <div className="space-y-6 animate-fade-in" id="participants-module">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-r-8 border-sme-gold">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-sme-navy" size={24} />
            إدارة بيانات المشاركين والطلبات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل وتعديل ومطابقة المشاركين بالدورات التدريبية المعتمدة لمركز أعمال طرابلس.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={exportToCSV}
            className="bg-sme-gold-light hover:bg-sme-gold-light/60 text-sme-gold-hover border border-sme-gold/20 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition"
            title="تصدير بصيغة Excel ملائمة"
          >
            <Download size={14} /> تصدير Excel
          </button>
          
          {canEdit && (
            <>
              <button 
                onClick={() => setIsImportOpen(true)}
                className="bg-sme-navy-soft hover:bg-sme-navy-soft/60 text-sme-navy border border-sme-navy-soft text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition"
              >
                <UploadCloud size={14} /> استيراد إكسل
              </button>

              <button 
                onClick={handleOpenAdd}
                className="bg-sme-navy hover:bg-sme-navy-light text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition"
              >
                <Plus size={16} /> تسجيل مشارك جديد
              </button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Filtration Drawer */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-3 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="الاسم، الرقم الوطني، الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sme-navy bg-slate-50"
          />
        </div>

        <div>
          <select 
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sme-navy bg-slate-50"
          >
            <option value="">جميع البرامج المسجلين بها</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>[{p.programNumber}] {p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select 
            value={passFilter}
            onChange={(e) => setPassFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sme-navy bg-slate-50"
          >
            <option value="">جميع الحالات التدريبية</option>
            <option value="passed">مجتاز بنجاح</option>
            <option value="pending">قيد الانتظار لم يبت فيه</option>
            <option value="failed">لم يجتز البرنامج</option>
          </select>
        </div>

        <div>
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sme-navy bg-slate-50"
          >
            <option value="">جميع مدن الإقامة</option>
            {uniqueCities.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredParticipants.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
            <p className="font-semibold text-sm">لا يوجد مشاركون مطابقون لخيارات التصفية والمعادلات المدخلة</p>
            <p className="text-xs text-slate-400 mt-1">تأكد من اختيار القسم أو البرنامج المدرب بدقة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-600">
                  <th className="p-4">الرقم العام</th>
                  <th className="p-4">المشارك والبيانات الوطنية</th>
                  <th className="p-4">وسائل التواصل</th>
                  <th className="p-4">البرنامج والمقام</th>
                  <th className="p-4 text-center">نسبة الحضور</th>
                  <th className="p-4 text-center">نتيجة التقييم</th>
                  <th className="p-4 text-center">حالة الاجتياز</th>
                  {canEdit && <th className="p-4 text-center">العمليات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredParticipants.map((p) => {
                  const prog = programs.find(pr => pr.id === p.programId);
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150">
                      
                      {/* ID Row */}
                      <td className="p-4 font-mono font-bold text-slate-500">
                        #{p.id.padStart(3, "0")}
                      </td>

                      {/* Name & National ID */}
                      <td className="p-4 space-y-1">
                        <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold font-mono">
                          <span>الرقم الوطني: {p.nationalId}</span>
                        </div>
                      </td>

                      {/* Communications */}
                                        {/* Attendance Rate */}
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`${p.attendanceRate >= 80 ? 'text-sme-navy font-bold' : 'text-red-600'} font-mono`}>
                            {p.attendanceRate}%
                          </span>
                          <span className="text-[9px] text-slate-400">{p.attendanceStatus === 'present' ? 'منتظم' : 'متقطع'}</span>
                        </div>
                      </td>

                      {/* Evaluation score */}
                      <td className="p-4 text-center">
                        <span className={`font-mono font-bold px-2 py-1 rounded bg-slate-100 ${
                          p.evaluation >= 80 ? 'text-sme-navy bg-sme-navy-soft' : 'text-slate-600'
                        }`}>
                          {p.evaluation} / 100
                        </span>
                      </td>

                      {/* Pass Status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block font-semibold px-2 py-0.5 rounded-full ${
                          p.passStatus === "passed" ? "bg-sme-navy-soft text-sme-navy" :
                          p.passStatus === "failed" ? "bg-red-100 text-red-800" : "bg-sme-gold-light text-sme-gold-hover border border-sme-gold/10"
                        }`}>
                          {p.passStatus === "passed" ? "ناجح ومجتاز" : p.passStatus === "failed" ? "غير مجتاز" : "قيد المراجعة"}
                        </span>
                      </td>

                      {/* Operations */}
                      {canEdit && (
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => handleOpenEdit(p)}
                              className="p-1 px-2 text-slate-600 hover:text-sme-navy bg-slate-50 hover:bg-slate-100 rounded-lg transition text-[11px] font-semibold border border-slate-100"
                              title="تحديث البيانات وعلامة الاجتياز"
                            >
                              تعديل / تقييم
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من إلغاء وحذف المشارك ${p.name}؟`)) {
                                  onDeleteParticipant(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="حذف وحساب"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT PARTICIPANT FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-sme-navy to-sme-navy-light px-6 py-4 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-base">
                  {editingPart ? "تعديل وتقييم المشارك" : "تسجيل مشارك جديد بالمنظومة"}
                </h3>
                <p className="text-[10px] text-sme-gold-light mt-0.5">
                  يرجى التحقق من الرقم الوطني والبيانات الأساسية قبل التدقيق والاعتماد الإداري.
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-white hover:bg-white/10 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم رباعي بالكامل *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: يوسف محمد عبد المطلوب الشريف"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sme-navy bg-slate-50"
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوطني *</label>
                  <input 
                    type="text" 
                    placeholder="رقم وطني فريد من 12 رقم"
                    maxLength={12}
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sme-navy bg-slate-50 font-mono text-right"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-mono"
                  />
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الشغال *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: 0912345678"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-mono"
                  />
                </div>

                {/* Birth Day */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الميلاد *</label>
                  <input 
                    type="date" 
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-mono"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجنس *</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                {/* Education */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المؤهل العلمي *</label>
                  <select 
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  >
                    <option value="ثانوي">ثانوي أو ما يعادلها</option>
                    <option value="دبلوم عالي">دبلوم عالي معهد</option>
                    <option value="بكالوريوس">بكالوريوس / إجازة عامة</option>
                    <option value="ماجستير">ماجستير</option>
                    <option value="دكتوراه">دكتوراه</option>
                  </select>
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الدقيق والشهادة</label>
                  <input 
                    type="text" 
                    placeholder="مثال: إداري مالي أو ميكاترونكس"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">الصفة الوظيفية الحالية</label>
                  <input 
                    type="text" 
                    placeholder="مثال: مدير فني أو عمل حر"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  />
                </div>

                {/* Employer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">جهة العمل / الشركة الناشئة</label>
                  <input 
                    type="text" 
                    placeholder="مثال: متجر مستقل أو موظف عام"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مدينة الإقامة الحالية *</label>
                  <select 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  >
                    <option value="طرابلس">طرابلس</option>
                    <option value="بنغازي">بنغازي</option>
                    <option value="مصراتة">مصراتة</option>
                    <option value="الزاوية">الزاوية</option>
                    <option value="سبها">سبها</option>
                    <option value="غريان">غريان</option>
                  </select>
                </div>

                {/* Register into Program */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البرنامج التدريبي المراد التنسيب إليه *</label>
                  <select 
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-sans"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>[{p.programNumber}] {p.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Attendance & Evaluations */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs border-b border-light-slate pb-1.5 flex items-center gap-1">
                  <Settings size={14} className="text-blue-600" />
                  رصد المتابعة والتقدير الأكاديمي والتحصيل
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Attendance status */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">حالة الحضور الإجمالية</label>
                    <select 
                      value={attendanceStatus}
                      onChange={(e) => setAttendanceStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="pending">قيد الانتظار لم يمتحن</option>
                      <option value="present">ملتزم بالحضور المنتظم</option>
                      <option value="absent">غير متلزم بغيابات</option>
                      <option value="excused">غائب بعذر مقبول</option>
                    </select>
                  </div>

                  {/* Attendance Rate */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">نسبة الحضور المئوية %</label>
                    <input 
                      type="number" 
                      min={0}
                      max={100}
                      value={attendanceRate}
                      onChange={(e) => setAttendanceRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-center font-mono"
                    />
                  </div>

                  {/* Evaluation Score */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">درجة التقييم النهائي (عشرون/مائة) *</label>
                    <input 
                      type="number" 
                      min={0}
                      max={100}
                      required
                      value={evaluation}
                      onChange={(e) => setEvaluation(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-center font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1.5">
                  {/* Pass decision */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">حالة وقرار الاجتياز والمطابقة *</label>
                    <select 
                      value={passStatus}
                      onChange={(e) => setPassStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="pending font-sans">قيد المراجعة وإنتظار النتائج</option>
                      <option value="passed">مجتاز بنجاح (مستحق للشهادة)</option>
                      <option value="failed">لم يجتز (غير مستحق للشهادة)</option>
                    </select>
                  </div>
                  
                  {/* Pass description prompt helpers */}
                  <div className="text-[10px] text-slate-500 leading-normal flex items-start gap-1 justify-center flex-col">
                    <span className="font-bold text-slate-700">دعم القرار التلقائي:</span>
                    <span>عند حفظ مشارك كـ "مجتاز بنجاح"، سيتاح لموظف الشهادات توليد شهادته كود QR بشكل آلي فوري.</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إدارية حول المشارك</label>
                <textarea 
                  rows={2}
                  placeholder="ملاحظات حول المهارات، أو فكرة موضوع رائع ريادي قدمه المشارك..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                ></textarea>
              </div>

              {/* Submit Controls */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  {editingPart ? "تأكيد التعديلات والحفظ" : "إضافة وتسجيل"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: SMART IMPORT FROM EXCEL */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  <UploadCloud size={20} />
                  نظام استيراد ومعالجة البيانات الذكي من Excel
                </h3>
                <p className="text-[10px] text-blue-200 mt-0.5">
                  انسخ الأعمدة مباشرة من ملف الإكسل (الاسم ثم الرقم الوطني ثم الهاتف والبريد والمدينة) والصقها هنا وسنتولى معالجتها.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsImportOpen(false);
                  setImportPreview([]);
                  setImportErrors([]);
                }} 
                className="text-white hover:bg-white/10 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Instructions on Excel Template */}
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100/60 text-[11px] leading-relaxed text-blue-950 space-y-1">
                <p className="font-bold flex items-center gap-1 text-xs">
                  <CheckCircle size={14} className="text-blue-600" /> 
                  نسق الأعمدة المقترحة في الإكسل بالترتيب التالي للحصول على أفضل دقة:
                </p>
                <p className="font-mono bg-white p-1.5 rounded text-center border border-blue-100 font-bold tracking-wide">
                  الاسم الرباعي | الرقم الوطني | رقم الهاتف | البريد الإلكتروني | المدينة | الوظيفة | جهة العمل
                </p>
              </div>

              {/* Raw copied data text input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">الصق البيانات المنسوخة من ملف Excel / Sheets هنا:</label>
                <textarea 
                  rows={6}
                  placeholder={`أحمد علي فرج الشريف\t119930283921\t0912223344\tahmed@mail.ly\tطرابلس\tعضو ريادي\tمهندس حر\nمريم مسعود الصالحين\t219960293411\t0926543210\tmimi@mail.ly\tطرابلس\tأعمال حرة\tمتجر منزلي`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-mono text-right"
                ></textarea>
              </div>

              {/* Duplication Resolution Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التعامل مع الأرقام الوطنية المكررة بالمنظومة</label>
                  <select 
                    value={importResolution}
                    onChange={(e) => setImportResolution(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="overwrite">تحديث واستبدال البيانات الموجودة في النظام</option>
                    <option value="merge">دمج البيانات وإلحاق الملاحظات الجديدة</option>
                    <option value="ignore">تجاهل العناصر المكررة والاحتفاظ بالأصلية</option>
                  </select>
                </div>
                
                <div className="flex items-end justify-start">
                  <button 
                    type="button" 
                    onClick={handleParseImport}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition w-full sm:w-auto"
                  >
                    معالجة وفحص البيانات المدخلة قبل الإدراج
                  </button>
                </div>
              </div>

              {/* PARSING ERRORS REPORT */}
              {importErrors.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-[10px] text-red-900 space-y-1">
                  <p className="font-bold text-xs flex items-center gap-1"><AlertTriangle size={14} /> تنبيهات وأخطاء في صياغة الملف:</p>
                  <ul className="list-disc pr-4 space-y-0.5">
                    {importErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PREVIEW CONTAINER */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                    <FileCheck2 size={16} className="text-blue-600" />
                    معاينة جدول البيانات الجاهزة للاستيراد وتحديد البرنامج المساعد ({importPreview.length} متدرب جاهز)
                  </h4>
                  
                  <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-48">
                    <table className="w-full text-right text-[10px]">
                      <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">الاسم المقترح</th>
                          <th className="p-2">الرقم الوطني</th>
                          <th className="p-2">رقم التواصل</th>
                          <th className="p-2">المدينة</th>
                          <th className="p-2">الصفة</th>
                          <th className="p-2">تنسيب البرنامج المتاح</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                        {importPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-100/20">
                            <td className="p-2 font-bold text-slate-800">{item.name}</td>
                            <td className="p-2 font-mono font-bold">{item.nationalId}</td>
                            <td className="p-2 font-mono">{item.phone}</td>
                            <td className="p-2">{item.city}</td>
                            <td className="p-2">{item.jobTitle} ({item.employer})</td>
                            <td className="p-2">
                              {/* inline list selection to match Excel imports directly to any training program */}
                              <select 
                                value={item.programId}
                                onChange={(e) => {
                                  const updated = [...importPreview];
                                  updated[idx].programId = e.target.value;
                                  setImportPreview(updated);
                                }}
                                className="border border-slate-200 rounded p-0.5 max-w-[160px]"
                              >
                                {programs.map(pr => (
                                  <option key={pr.id} value={pr.id}>[{pr.programNumber}] {pr.name}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={triggerBatchImport}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md transition"
                    >
                      تأكيد استيراد وحفظ كافة السجلات في المنظومة الآن
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
