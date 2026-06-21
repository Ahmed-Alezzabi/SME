import React, { useState } from "react";
import { Participant, TrainingProgram } from "../types";
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  BookOpen, 
  CheckSquare, 
  Activity, 
  Users, 
  FileCheck2, 
  Award, 
  BarChart4, 
  TrendingUp, 
  PieChart as PieIcon,
  HelpCircle,
  MapPin,
  Calendar
} from "lucide-react";

interface ReportsModuleProps {
  participants: Participant[];
  programs: TrainingProgram[];
}

export default function ReportsModule({ participants, programs }: ReportsModuleProps) {
  const [selectedReportTab, setSelectedReportTab] = useState<'programs' | 'participants' | 'attendance' | 'certificates' | 'annual'>('programs');
  const [selectedProgId, setSelectedProgId] = useState("");

  // Stats calculate
  const totalPrograms = programs.length;
  const totalParticipants = participants.length;
  const passedCount = participants.filter(p => p.passStatus === "passed").length;
  const attendanceAvg = participants.length 
    ? Math.round(participants.reduce((sum, p) => sum + p.attendanceRate, 0) / participants.length)
    : 0;

  // Year filter helper (we assume 2026 dataset)
  const currentYearPrograms = programs.filter(p => p.startDate.includes("2026"));

  // Excel/CSV Direct download creator helper
  const handleExportCSV = (tab: string) => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let fileName = `تقرير_${tab}.csv`;

    if (tab === 'programs') {
      headers = ["الكود", "اسم البرنامج التدريبي", "النوع", "المدرب", "المدينة", "الحالة", "الحد الأقصى", "التاريخ والمدة"];
      rows = programs.map(p => [
        p.programNumber,
        p.name,
        p.type,
        p.trainer,
        p.city,
        p.status,
        p.maxParticipants,
        `"${p.startDate} - ${p.endDate}"`
      ]);
    } else if (tab === 'participants') {
      headers = ["الاسم الرباعي", "الرقم الوطني", "رقم الهاتف", "المدينة", "الوظيفية", "الشركة", "نسبة الحضور", "النتيجة", "الاجتياز"];
      rows = participants.map(p => [
        p.name,
        `"${p.nationalId}"`,
        p.phone,
        p.city,
        p.jobTitle,
        p.employer,
        `${p.attendanceRate}%`,
        p.evaluation,
        p.passStatus
      ]);
    } else {
      headers = ["الاسم", "رقم الشهادة الصادرة", "الرقم الوطني", "تاريخ الاعتماد", "كود الدورة التدريبية"];
      rows = participants.filter(p => p.certificateId).map(p => [
        p.name,
        p.certificateId,
        `"${p.nationalId}"`,
        p.certificateDate || "غير محدد",
        p.programId
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Program focus details logic
  const activeProg = programs.find(p => p.id === selectedProgId) || programs[0];
  const activeProgParts = activeProg ? participants.filter(p => p.programId === activeProg.id) : [];
  const progPartsPassed = activeProgParts.filter(p => p.passStatus === 'passed').length;
  const progAverageEvaluation = activeProgParts.length
    ? Math.round(activeProgParts.reduce((sum, p) => sum + p.evaluation, 0) / activeProgParts.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in" id="reports-and-intelligence-module">
      
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-700" size={24} />
            التقارير المتقدمة وتحليل الفعالية
          </h2>
          <p className="text-xs text-slate-500 mt-1">توليد تقارير الأنشطة الإجمالية للبرامج وتقديرات المتدربين مع خيارات PDF والطباعة والـ Excel.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <button 
            onClick={() => handleExportCSV(selectedReportTab)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition"
          >
            <Download size={13} /> تصدير Excel / CSV
          </button>
          
          <button 
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition"
          >
            <Printer size={13} /> طباعة التقرير (PDF)
          </button>
        </div>
      </div>

      {/* Internal Ribbon Switch Control */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 no-print overflow-x-auto">
        <button 
          onClick={() => setSelectedReportTab('programs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${selectedReportTab === 'programs' ? 'bg-white text-slate-800 shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <BookOpen size={14} /> كشوفات البرامج
        </button>
        <button 
          onClick={() => setSelectedReportTab('participants')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${selectedReportTab === 'participants' ? 'bg-white text-slate-800 shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Users size={14} /> كشوفات الحضور والتقييم
        </button>
        <button 
          onClick={() => setSelectedReportTab('certificates')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${selectedReportTab === 'certificates' ? 'bg-white text-slate-800 shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Award size={14} /> تقرير إصدار الشهادات
        </button>
        <button 
          onClick={() => setSelectedReportTab('annual')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${selectedReportTab === 'annual' ? 'bg-white text-slate-800 shadow' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <BarChart4 size={14} /> التقرير والبيان السنوي
        </button>
      </div>

      {/* RENDER ACTIVE TAB REPORT VIEW */}
      
      {/* 1. PROGRAMS REPORT PANEL */}
      {selectedReportTab === 'programs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quick selector */}
            <div className="md:col-span-1 space-y-3 border-l pb-3 border-slate-100 pl-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <CheckSquare size={16} className="text-emerald-700" />
                اختر البرنامج لعرض تقريره المفصل
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                اختر أي دورة تدريبية منتهية أو نشطة للفرز والمتابعة الإحصائية لنسب النجاح والتقادير.
              </p>
              
              <select 
                value={selectedProgId}
                onChange={(e) => setSelectedProgId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-800 bg-slate-50 font-semibold"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>[{p.programNumber}] {p.name}</option>
                ))}
              </select>
            </div>

            {/* Detailed Analytics cards */}
            {activeProg ? (
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold block">إجمالي المسجلين</span>
                  <span className="text-2xl font-black text-slate-800 font-mono">{activeProgParts.length}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">من أصل {activeProg.maxParticipants} شاغر</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold block">عدد الناجحين</span>
                  <span className="text-2xl font-black text-emerald-800 font-mono">{progPartsPassed}</span>
                  <p className="text-[10px] text-emerald-600 mt-0.5">استحقاق شهادة</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold block">متوسط معدل العلامات</span>
                  <span className="text-2xl font-black text-slate-800 font-mono">{progAverageEvaluation}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">درجة الرصد الكلي</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold block">مكان وحالة التدريب</span>
                  <span className="text-xs font-extrabold text-slate-800 block mt-1">{activeProg.city}</span>
                  <p className="text-[10px] text-slate-400 truncate">{activeProg.location}</p>
                </div>
              </div>
            ) : null}

          </div>

          {/* Active Program's registered participants list */}
          {activeProg && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                قائمة المشاركين المقيدين بدورة: <span className="text-emerald-800">{activeProg.name}</span>
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600">
                    <tr>
                      <th className="p-3">اسم المتدرب المعتمد</th>
                      <th className="p-3">الرقم الوطني</th>
                      <th className="p-3">المهنة وجهة العمل</th>
                      <th className="p-3 text-center">أيام الحضور</th>
                      <th className="p-3 text-center">المستوى الدراسي والتقييم</th>
                      <th className="p-3 text-center">رمز الشهادة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProgParts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-slate-400">لا يوجد متدربين مسجلين مسجلين بهذه الدورة التدريبية بعد.</td>
                      </tr>
                    ) : (
                      activeProgParts.map(p => (
                        <tr key={p.id}>
                          <td className="p-3 font-bold text-slate-800">{p.name}</td>
                          <td className="p-3 font-mono text-slate-500 font-semibold">{p.nationalId}</td>
                          <td className="p-3">{p.jobTitle} - {p.employer}</td>
                          <td className="p-3 text-center font-bold text-slate-700 font-mono">{p.attendanceRate}%</td>
                          <td className="p-3 text-center">
                            <span className="font-mono bg-slate-100 font-bold text-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              {p.evaluation} / 100
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-800">{p.certificateId || "غير صادرة"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PARTICIPANTS LIST REPORT TAB */}
      {selectedReportTab === 'participants' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="text-teal-700" size={18} />
              رصد الحضور المنتظم ومعدات تقييم المشروعات
            </h3>
            <span className="text-xs text-slate-500 font-semibold">إجمالي الكشوفات المسجلة: {totalParticipants} مشارك</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">اسم المتدرب المعتمد</th>
                  <th className="p-3">البرنامج الفرعي</th>
                  <th className="p-3 text-center">حالة الدخول</th>
                  <th className="p-3 text-center">نسبة الحضور</th>
                  <th className="p-3 text-center">التقييم الرقمي</th>
                  <th className="p-3 text-center">قرار اللجنة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {participants.map(p => {
                  const pr = programs.find(item => item.id === p.programId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3">{pr ? pr.name : "غير محدد"}</td>
                      <td className="p-3 text-center text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${p.attendanceStatus === 'present' ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900'}`}>
                          {p.attendanceStatus === 'present' ? 'منضبط' : 'غيابات'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-teal-800">{p.attendanceRate}%</td>
                      <td className="p-3 text-center font-mono font-bold">{p.evaluation} / 100</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.passStatus === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {p.passStatus === 'passed' ? 'معتمد للاجتياز' : 'انتظار الفرز'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CERTIFICATES REPORT PANEL */}
      {selectedReportTab === 'certificates' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="text-amber-500" size={18} />
              سجل الشهادات الصادرة والوثائق الوطنية المعتمدة
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold">
              مجموع الشهادات: {participants.filter(p => p.certificateId).length} شهادة صادرة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-sans">
                <tr>
                  <th className="p-3">رقم الشهادة</th>
                  <th className="p-3">تاريخ التوثيق</th>
                  <th className="p-3">اسم المستحق</th>
                  <th className="p-3">الرقم الوطني للمطابقة</th>
                  <th className="p-3">الدورة التنموية المسجل بها</th>
                  <th className="p-3 text-center">أمان التوثيق QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {participants.filter(p => p.certificateId).map(p => {
                  const pr = programs.find(item => item.id === p.programId);
                  return (
                    <tr key={p.id}>
                      <td className="p-3 font-mono font-bold text-emerald-800">{p.certificateId}</td>
                      <td className="p-3 font-mono font-bold">{p.certificateDate}</td>
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 font-mono">{p.nationalId}</td>
                      <td className="p-3">{pr ? pr.name : "برنامج ريادة عام"}</td>
                      <td className="p-3 text-center text-[10px] text-teal-800 font-bold">صالح ومعتمد ✓</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ANNUAL / GENERAL STATE REPORT TAB */}
      {selectedReportTab === 'annual' && (
        <div className="space-y-6">
          {/* Key metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 block">برامج عام 2026 المنجزة</span>
              <span className="text-3xl font-black text-slate-800 font-mono">{currentYearPrograms.length}</span>
              <p className="text-[10px] text-slate-500">منظومة البرامج السنوية الموحدة لمركز طرابلس</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 block">إجمالي كفاءات رواد الأعمال</span>
              <span className="text-3xl font-black text-emerald-800 font-mono">{passedCount} منتسب</span>
              <p className="text-[10px] text-emerald-600 mt-0.5">جاهزين لاستلام صكوك التميز والتمويل</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 block">متوسط معدل الحضور الكلي</span>
              <span className="text-3xl font-black text-teal-800 font-mono">{attendanceAvg}%</span>
              <p className="text-[10px] text-slate-500">مؤشر انضباطية البرامج والجدولة</p>
            </div>
          </div>

          {/* Annual text digest representation */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
              التوجه السنوي والجدول التدريبي لمركز أعمال طرابلس (2026)
            </h3>
            
            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              تظهر بيانات الربع الأول والثاني لعام 2026 تسارعاً إيجابياً في طلبات الالتحاق بالبرامج التدريبية المعتمدة لمركز أعمال طرابلس التابع للبرنامج الوطني لدعم المشروعات الصغرى والمتوسطة.
              تم تنظيم ما يزيد عن <span className="font-bold">{programs.length} برامج تدريبية تخصصية</span> ركزت بشكل أساسي على "دراسات الجدوى المالي لغير الماليين"، "التسويق وتنمية الهوية الرقمية"، ومبادئ "ريادة الأعمال للمشروعات الصغرى لتمكين شريحة الشباب والنساء الرياديات".
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 italic space-y-1.5 text-xs text-right leading-relaxed">
              <span className="font-bold text-slate-900 block font-sans">توصيات اللجنة الفنية للمنظومة:</span>
              <p>1. التوسع في المنصات الافتراضية والبرامج الهجينة لتغطية مدن الكفوف والأطراف مثل غريان والزاوية مصراتة.</p>
              <p>2. اعتماد شهادة الـ QR الفريدة كشرط رئيسي لقبول ملف طلبات القروض المالية أمام لجنة التمويل المعنية.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
