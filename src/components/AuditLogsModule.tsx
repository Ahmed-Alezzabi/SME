import React, { useState } from "react";
import { AuditLog, UserRole } from "../types";
import { 
  ShieldAlert, 
  Trash2, 
  Activity, 
  RotateCcw, 
  Key, 
  Users, 
  BookOpen, 
  Lock, 
  Database,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  UserCheck
} from "lucide-react";

interface AuditLogsModuleProps {
  logs: AuditLog[];
  userRole: UserRole;
  currentUser: string;
  onRoleChange: (role: UserRole) => void;
  onSystemReset: () => void;
}

export default function AuditLogsModule({
  logs,
  userRole,
  currentUser,
  onRoleChange,
  onSystemReset
}: AuditLogsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredLogs = logs.filter(log => {
    const matchSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = categoryFilter ? log.category === categoryFilter : true;
    return matchSearch && matchCategory;
  });

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "programs": return "bg-blue-100 text-blue-800";
      case "participants": return "bg-sky-100 text-sky-800";
      case "certificates": return "bg-amber-100 text-amber-800";
      case "system": return "bg-slate-100 text-slate-800";
      case "import": return "bg-indigo-100 text-indigo-800";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "programs": return "دورة تدريبية";
      case "participants": return "تسجيل متدربين";
      case "certificates": return "إصدار شهادات";
      case "system": return "نظام عام";
      case "import": return "استيراد إكسل";
      default: return cat;
    }
  };

  const rolesObj: { value: UserRole; label: string; desc: string }[] = [
    { value: "admin", label: "مدير النظام", desc: "صلاحيات تامة في التحكم بكافة الأقسام والمستويات والبرامج واللوادر" },
    { value: "trainer", label: "موظف التدريب", desc: "إضافة وتعديل وأرشفة وجدولة البرامج التدريبية فقط" },
    { value: "registrar", label: "موظف التسجيل", desc: "إدارة وتسجيل واستيراد المشاركين وتقييم درجاتهم وحضورهم" },
    { value: "certificates", label: "موظف الشهادات", desc: "إصدار ومعاينة وطباعة وأرشفة الشهادات الإلكترونية برمز QR" },
    { value: "readonly", label: "قارئ فقط للبيانات", desc: "عرض المنظومة والتقارير الإحصائية والبحث المتقدم فقط بدون صلاحيات تعديل" }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="security-module">
      
      {/* Simulation Simulator Frame */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl">
            <Lock size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold">بوابة محاكاة وصلاحيات الأدوار والمستخدمين (RBAC Simulation)</h2>
            <p className="text-[11px] text-slate-300 mt-0.5">قم بتبديل الدور والمهنة في الأسفل لتجربة لوحة التحكم بحسب صلاحيات الموظفين الفعلية لمركز طرالبس.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-3">
          {rolesObj.map((role) => {
            const isCurrent = userRole === role.value;
            return (
              <div 
                key={role.value}
                onClick={() => onRoleChange(role.value)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent 
                    ? 'bg-blue-950/80 border-blue-600 ring-2 ring-blue-500' 
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
              >
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isCurrent ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {isCurrent ? "نشط حالياً" : "صلاحية متاحة"}
                  </span>
                  <h4 className="text-xs font-bold font-sans pt-1 text-slate-100">{role.label}</h4>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">{role.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Audit Log Monitor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="text-blue-600" size={18} />
              سجل تدقيق الأمان والعمليات (Audit Logs)
            </h3>
            <span className="text-xs text-slate-500 font-semibold">كل العمليات مجدولة للرقابة والامتثال القانوني</span>
          </div>

          {/* Simple controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="البحث بالموظف، الإجراء، أو التفاصيل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none bg-slate-50 font-semibold"
            >
              <option value="">جميع فئات العمليات</option>
              <option value="programs">إدارة البرامج التدريبية</option>
              <option value="participants">إدارة شؤون المتدربين</option>
              <option value="certificates">إصدار الشهادات الإلكترونية</option>
              <option value="system">النظام والتهيئة</option>
            </select>
          </div>

          {/* Log Table/List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs italic">لا توجد سجلات أمان توافق خيارات البحث الحالية.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-2 relative">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.user}</span>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">
                        ({log.role})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getCategoryBadgeClass(log.category)}`}>
                        {getCategoryLabel(log.category)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                        <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString("ar-LY")}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 font-semibold">{log.action}</p>
                  <p className="text-[10px] text-slate-500 font-medium bg-white p-1 rounded border leading-relaxed px-2 font-serif">{log.details}</p>
                  
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Administration & Reset option */}
        <div className="space-y-6">
          
          {/* Active Backup / DB stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Database size={18} className="text-blue-600" />
              إدارة بيئة التشغيل واستقرار الداتا
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              تدار هذه المنظومة التنموية بالاعتماد على خادم سحابي محلي طرابلس متصل بقاعدة بيانات JSON مشفرة للأمان الدائم ومستعدة لمزامنة PostgreSQL.
            </p>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-500">حالة خط الخادم:</span>
                <span className="text-blue-600 font-bold">نشط وآمن (Online)</span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-500">خط الاستجابة:</span>
                <span className="text-blue-600 font-bold font-mono">15ms (طرابلس)</span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-500">مستوى حماية الجلسة:</span>
                <span className="text-blue-800 font-bold">ببروتوكول SSL + JWT</span>
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="pt-3 border-t border-slate-50">
                <button 
                  onClick={() => {
                    if (confirm("هل ترغب فعلاً في تنظيف المنظومة بالكامل وإعادتها للحالة الافتراضية للتهيئة لأول مرة؟")) {
                      onSystemReset();
                    }
                  }}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-extrabold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 justify-center transition"
                >
                  <RotateCcw size={14} /> إعادة ضبط قاعدة البيانات للتهيئة
                </button>
              </div>
            )}
          </div>

          {/* Security tips */}
          <div className="bg-blue-950 text-blue-100 p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <HelpCircle size={14} /> مبدأ الأمان القومي للمشروعات
            </h4>
            <p className="text-[10px] leading-relaxed opacity-90 font-medium">
              المنظومة مصممة لضمان خصوصية بيانات رواد الأعمال الليبيين. يمنع تداول الأرقام الوطنية للمواطنين أو الهواتف خارج المنظومة المعتمدة لمركز طرابلس.
              يرجى قفل أو تفعيل دور "قارئ فقط" للمتصفح في حال مغادرة قاعة التسجيل والامتحانات بمركز التدريب.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
