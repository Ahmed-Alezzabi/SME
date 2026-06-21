import React from "react";
import { TrainingProgram, Participant, SystemStats } from "../types";
import { 
  Award, 
  BookOpen, 
  Users, 
  CheckCircle, 
  PlusCircle, 
  TrendingUp, 
  MapPin, 
  Calendar as CalendarIcon,
  UploadCloud,
  FileSpreadsheet
} from "lucide-react";

interface DashboardProps {
  programs: TrainingProgram[];
  participants: Participant[];
  stats: SystemStats;
  onNavigate: (tab: string) => void;
  onOpenAddProgram: () => void;
  onOpenImport: () => void;
}

export default function Dashboard({ 
  programs, 
  participants, 
  stats, 
  onNavigate,
  onOpenAddProgram,
  onOpenImport
}: DashboardProps) {
  
  // Calculate distribution by City for custom visual SVG chart
  const cityCount: { [key: string]: number } = {};
  participants.forEach(p => {
    const city = p.city || "غير محدد";
    cityCount[city] = (cityCount[city] || 0) + 1;
  });
  const cities = Object.entries(cityCount).map(([name, count]) => ({ name, count }));

  // Calculate pass rates
  const passed = participants.filter(p => p.passStatus === "passed").length;
  const failed = participants.filter(p => p.passStatus === "failed").length;
  const pending = participants.filter(p => p.passStatus === "pending").length;
  const totalWithStatus = passed + failed + pending || 1;

  const passPercent = Math.round((passed / totalWithStatus) * 100);
  const pendingPercent = Math.round((pending / totalWithStatus) * 100);
  const failedPercent = Math.round((failed / totalWithStatus) * 100);

  // Status Distribution
  const activeCount = programs.filter(p => p.status === "active").length;
  const planningCount = programs.filter(p => p.status === "planning").length;
  const completedCount = programs.filter(p => p.status === "completed").length;

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-module">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute left-0 bottom-0 opacity-10 transform -translate-x-12 translate-y-6 pointer-events-none">
          <Award size={240} />
        </div>
        <div className="relative z-10 space-y-2">
          <p className="text-emerald-200 text-sm font-semibold tracking-wide">البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة</p>
          <h2 className="text-2xl md:text-3xl font-bold">لوحة تحكم مركز أعمال طرابلس</h2>
          <p className="text-emerald-50 text-sm max-w-2xl leading-relaxed">
            مرحباً بك في المنظومة الإدارية الموحدة. يمكنك إدارة الأنشطة التنموية، وتتبع حضور وتقييم المشاركين، وإصدار وتوثيق شهادات التدريب الإلكترونية المعتمدة برمز QR.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div 
          onClick={() => onNavigate("programs")}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-200 transition cursor-pointer"
          id="stat-programs"
        >
          <div className="space-y-1">
            <span className="text-slate-500 text-sm font-medium">البرامج التدريبية</span>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalPrograms}</h3>
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> {activeCount} نشط حالياً
            </span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-700">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onNavigate("participants")}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-200 transition cursor-pointer"
          id="stat-participants"
        >
          <div className="space-y-1">
            <span className="text-slate-500 text-sm font-medium">المشاركون المسجلون</span>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalParticipants}</h3>
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
              <Users size={12} /> من مختلف المدن الليبية
            </span>
          </div>
          <div className="bg-teal-50 p-4 rounded-xl text-teal-700">
            <Users size={24} />
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onNavigate("participants")}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-200 transition cursor-pointer"
          id="stat-graduates"
        >
          <div className="space-y-1">
            <span className="text-slate-500 text-sm font-medium">المجتازون بنجاح</span>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalGraduates}</h3>
            <span className="text-teal-600 text-xs font-semibold flex items-center gap-1">
              <CheckCircle size={12} /> نسبة النجاح {passPercent}%
            </span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-700">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onNavigate("certificates")}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-200 transition cursor-pointer"
          id="stat-certificates"
        >
          <div className="space-y-1">
            <span className="text-slate-500 text-sm font-medium">الشهادات الصادرة</span>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalCertificates}</h3>
            <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
              <Award size={12} /> موثقة برمز استجابة QR
            </span>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl text-amber-700">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Layout (Analytics & Shortcuts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Participants by City */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="text-emerald-700" size={18} />
              المشاركون حسب المدن الليبية
            </h3>
            <span className="text-xs text-slate-400">إحصاء جغرافي</span>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-64 flex flex-col justify-end pt-4">
            {cities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                لا توجد بيانات جغرافية لعرضها حالياً
              </div>
            ) : (
              <div className="flex items-end justify-between h-48 px-4 border-b border-slate-100">
                {cities.map((city, idx) => {
                  const maxCount = Math.max(...cities.map(c => c.count)) || 1;
                  const percentHeight = Math.max(10, (city.count / maxCount) * 100);
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                      {/* Bar Val */}
                      <span className="text-xs font-semibold text-slate-700 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-1.5 py-0.5 rounded leading-none">
                        {city.count}
                      </span>
                      {/* Bar Fill */}
                      <div 
                        style={{ height: `${percentHeight}%` }} 
                        className="w-8 sm:w-12 bg-gradient-to-t from-emerald-700 to-teal-500 rounded-t-lg shadow-sm hover:from-emerald-600 hover:to-teal-400 transition-all duration-500 relative"
                      >
                        <div className="absolute top-1 left-1.5 right-1.5 h-1.5 bg-white/20 rounded-full"></div>
                      </div>
                      {/* Label */}
                      <span className="text-xs font-semibold text-slate-600 mt-2 truncate w-14 text-center">
                        {city.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span> الكثافة المسجلة</span>
              <span className="text-slate-400">|</span>
              <span>تحديث تلقائي</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Success Rates Donut */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Award className="text-amber-600" size={18} />
              نتائج تقييم واجتياز الدورات
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            {/* Elegant Custom SVG Pie/Donut Chart */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Line */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                
                {/* Passed Slice */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="none" 
                  stroke="#057567" strokeWidth="3.2" 
                  strokeDasharray={`${passPercent} ${100 - passPercent}`} 
                  strokeDashoffset="0" 
                  className="transition-all duration-1000"
                />

                {/* Pending Slice */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="none" 
                  stroke="#fbbf24" strokeWidth="3.2" 
                  strokeDasharray={`${pendingPercent} ${100 - pendingPercent}`} 
                  strokeDashoffset={-passPercent} 
                  className="transition-all duration-1000"
                />

                {/* Failed Slice */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="none" 
                  stroke="#ef4444" strokeWidth="3.2" 
                  strokeDasharray={`${failedPercent} ${100 - failedPercent}`} 
                  strokeDashoffset={-(passPercent + pendingPercent)} 
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{passPercent}%</span>
                <span className="text-[10px] text-slate-400 font-semibold">نسبة النجاح</span>
              </div>
            </div>

            {/* Legend Indicators */}
            <div className="w-full space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-800"></span>
                  <span className="text-slate-600">ناجح ومجتاز</span>
                </div>
                <span className="font-bold text-slate-800">{passed} متدرب ({passPercent}%)</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="text-slate-600">قيد الانتظار/المراجعة</span>
                </div>
                <span className="font-bold text-slate-800">{pending} متدرب ({pendingPercent}%)</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-slate-600">غير مجتاز</span>
                </div>
                <span className="font-bold text-slate-800">{failed} متدرب ({failedPercent}%)</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Action Matrix & Program Status Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Actions Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-1 space-y-4">
          <h3 className="text-md font-bold text-slate-800">عمليات سريعة</h3>
          <div className="grid grid-cols-1 gap-2.5">
            <button 
              onClick={onOpenAddProgram}
              className="flex items-center gap-3 w-full p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl transition font-medium text-sm text-right"
            >
              <span className="bg-emerald-600 p-2 rounded-lg text-white">
                <PlusCircle size={18} />
              </span>
              <div>
                <p className="font-bold text-slate-800">إضافة دورة تدريبية</p>
                <p className="text-[11px] text-slate-500">تخطيط وجدولة برنامج جديد</p>
              </div>
            </button>

            <button 
              onClick={onOpenImport}
              className="flex items-center gap-3 w-full p-3 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl transition font-medium text-sm text-right"
            >
              <span className="bg-teal-600 p-2 rounded-lg text-white">
                <UploadCloud size={18} />
              </span>
              <div>
                <p className="font-bold text-slate-800">استيراد مشاركين</p>
                <p className="text-[11px] text-slate-500">رفع جماعي ذكي من ملف إكسل</p>
              </div>
            </button>

            <button 
              onClick={() => onNavigate("calendar")}
              className="flex items-center gap-3 w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl transition font-medium text-sm text-right"
            >
              <span className="bg-slate-700 p-2 rounded-lg text-white">
                <CalendarIcon size={18} />
              </span>
              <div>
                <p className="font-bold text-slate-800">تقويم مركز الأعمال</p>
                <p className="text-[11px] text-slate-500">جدول الفترات والبرامج المفتوحة</p>
              </div>
            </button>

            <button 
              onClick={() => onNavigate("reports")}
              className="flex items-center gap-3 w-full p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl transition font-medium text-sm text-right"
            >
              <span className="bg-amber-600 p-2 rounded-lg text-white">
                <FileSpreadsheet size={18} />
              </span>
              <div>
                <p className="font-bold text-slate-800">التقارير والإحصائيات</p>
                <p className="text-[11px] text-slate-500">تصدير PDF / Excel للأنشطة</p>
              </div>
            </button>
          </div>
        </div>

        {/* Current status summary of training modules */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2 space-y-4">
          <h3 className="text-md font-bold text-slate-800 flex items-center justify-between">
            <span>حالة البرامج التدريبية المقيدة</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{programs.length} برنامج</span>
          </h3>

          <div className="space-y-4">
            {/* Active Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>البرامج النشطة حالياً (التنفيذ الفعلي)</span>
                <span className="text-teal-700">{activeCount} برنامج</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(activeCount / (programs.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Scheduled Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>البرامج قيد التخطيط والتسجيل والترتيب</span>
                <span className="text-amber-500">{planningCount} برنامج</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(planningCount / (programs.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Completed Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>البرامج التنموية المكتملة</span>
                <span className="text-emerald-700">{completedCount} برنامج</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(completedCount / (programs.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            يتم تحديث المؤشرات تلقائياً بالتزامن مع تعديل حالة أي برنامج أو مشارك في المنظومة.
          </div>
        </div>

      </div>
    </div>
  );
}
