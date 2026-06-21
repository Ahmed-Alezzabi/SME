import React, { useState } from "react";
import { TrainingProgram } from "../types";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileCheck, 
  Copy, 
  Archive, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User, 
  Info,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface ProgramsListProps {
  programs: TrainingProgram[];
  userRole: string;
  onAddProgram: (program: Omit<TrainingProgram, "id">) => void;
  onUpdateProgram: (id: string, program: Partial<TrainingProgram>) => void;
  onDeleteProgram: (id: string) => void;
}

export default function ProgramsList({ 
  programs, 
  userRole, 
  onAddProgram, 
  onUpdateProgram, 
  onDeleteProgram 
}: ProgramsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);

  // Form states
  const [programNumber, setProgramNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("حضورى");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState(5);
  const [hours, setHours] = useState(20);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("طرابلس");
  const [trainer, setTrainer] = useState("");
  const [organization, setOrganization] = useState("مركز أعمال طرابلس");
  const [targetGroup, setTargetGroup] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(25);
  const [status, setStatus] = useState<'planning' | 'active' | 'completed' | 'archived'>("planning");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setProgramNumber("");
    setName("");
    setType("حضورى");
    setStartDate("");
    setEndDate("");
    setDays(5);
    setHours(20);
    setLocation("");
    setCity("طرابلس");
    setTrainer("");
    setOrganization("مركز أعمال طرابلس");
    setTargetGroup("");
    setMaxParticipants(25);
    setStatus("planning");
    setNotes("");
    setEditingProgram(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prog: TrainingProgram) => {
    setEditingProgram(prog);
    setProgramNumber(prog.programNumber);
    setName(prog.name);
    setType(prog.type);
    setStartDate(prog.startDate);
    setEndDate(prog.endDate);
    setDays(prog.days);
    setHours(prog.hours);
    setLocation(prog.location);
    setCity(prog.city);
    setTrainer(prog.trainer);
    setOrganization(prog.organization);
    setTargetGroup(prog.targetGroup);
    setMaxParticipants(prog.maxParticipants);
    setStatus(prog.status);
    setNotes(prog.notes || "");
    setIsModalOpen(true);
  };

  const handleDuplicate = (prog: TrainingProgram) => {
    const copy: Omit<TrainingProgram, "id"> = {
      programNumber: `${prog.programNumber}-نسخة`,
      name: `${prog.name} (نسخة مكررة)`,
      type: prog.type,
      startDate: prog.startDate,
      endDate: prog.endDate,
      days: prog.days,
      hours: prog.hours,
      location: prog.location,
      city: prog.city,
      trainer: prog.trainer,
      organization: prog.organization,
      targetGroup: prog.targetGroup,
      maxParticipants: prog.maxParticipants,
      status: "planning",
      notes: `نسخة منسوخة من البرنامج التدريبي ذي المعرف ${prog.programNumber}.`
    };
    onAddProgram(copy);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const programData = {
      programNumber,
      name,
      type,
      startDate,
      endDate,
      days: Number(days),
      hours: Number(hours),
      location,
      city,
      trainer,
      organization,
      targetGroup,
      maxParticipants: Number(maxParticipants),
      status,
      notes
    };

    if (editingProgram) {
      onUpdateProgram(editingProgram.id, programData);
    } else {
      onAddProgram(programData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleArchive = (prog: TrainingProgram) => {
    onUpdateProgram(prog.id, { status: "archived" });
  };

  // Filtered program logic
  const filteredPrograms = programs.filter(p => {
    const matchSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.programNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.trainer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCity = cityFilter ? p.city === cityFilter : true;
    const matchStatus = statusFilter ? p.status === statusFilter : true;

    return matchSearch && matchCity && matchStatus;
  });

  const uniqueCities = Array.from(new Set(programs.map(p => p.city).filter(Boolean)));

  const getStatusLabelAndStyle = (stat: string) => {
    switch (stat) {
      case "active":
        return { label: "نشط حالياً", bg: "bg-emerald-100 text-emerald-800", ring: "ring-emerald-600/10" };
      case "planning":
        return { label: "قيد التخطيط", bg: "bg-amber-100 text-amber-800", ring: "ring-amber-600/10" };
      case "completed":
        return { label: "مكتمل", bg: "bg-teal-100 text-teal-800", ring: "ring-teal-600/10" };
      case "archived":
        return { label: "مؤرشف", bg: "bg-slate-100 text-slate-600", ring: "ring-slate-600/10" };
      default:
        return { label: "غير معروف", bg: "bg-slate-100 text-slate-800", ring: "ring-slate-600/10" };
    }
  };

  const canEdit = userRole === 'admin' || userRole === 'trainer';

  return (
    <div className="space-y-6 animate-fade-in" id="programs-module">
      
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-emerald-700" size={24} />
            إدارة البرامج والأنشطة التدريبية
          </h2>
          <p className="text-xs text-slate-500 mt-1">تخطيط وجدولة ومتابعة الدورات التنموية لرواد وبناة المشروعات الصغرى.</p>
        </div>
        {canEdit && (
          <button 
            onClick={handleOpenAdd}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition self-start sm:self-auto"
            id="btn-add-program"
          >
            <Plus size={16} /> إضافة برنامج تدريبي
          </button>
        )}
      </div>

      {/* Searching Bar & Filtration Options */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-3 top-3 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="البحث باسم البرنامج، الرقم الشفري للبرنامج، أو اسم المدرب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
          />
        </div>

        <div>
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
          >
            <option value="">جميع المدن</option>
            {uniqueCities.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
          >
            <option value="">كل الحالات</option>
            <option value="planning">قيد التخطيط والتسجيل</option>
            <option value="active">نشط (جارٍ تنفيذه)</option>
            <option value="completed">مكتمل ومغلق</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>
      </div>

      {/* Programs List / Cards Layout */}
      {filteredPrograms.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 shadow-sm text-slate-500">
          <Info className="mx-auto mb-3 text-slate-400" size={40} />
          <p className="text-sm font-semibold">لم يتم العثور على برامج تدريبية مطابقة لمعايير البحث والمطابقة الحالية</p>
          <p className="text-xs text-slate-400 mt-1">كافة المدخلات محفوظة بشكل دائم في خادم محلي طرابلس.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const statusConfig = getStatusLabelAndStyle(prog.status);
            return (
              <div 
                key={prog.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                id={`program-card-${prog.id}`}
              >
                {/* Header Strip with Color depending on state */}
                <div className={`h-1.5 w-full ${
                  prog.status === 'active' ? 'bg-teal-600' :
                  prog.status === 'planning' ? 'bg-amber-400' :
                  prog.status === 'completed' ? 'bg-emerald-700' : 'bg-slate-400'
                }`}></div>

                <div className="p-5 flex-1 space-y-4">
                  {/* Program Number & State Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {prog.programNumber}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 h-10 group-hover:text-emerald-800 transition-colors">
                    {prog.name}
                  </h3>

                  {/* Meta Details */}
                  <div className="grid grid-cols-2 gap-3 text-slate-600 text-[11px] font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>{prog.hours} ساعة / {prog.days} أيام</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="truncate">{prog.city} - {prog.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      <span className="truncate">{prog.trainer}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-slate-400" />
                      <span>الحد الأقصى: {prog.maxParticipants} متدرب</span>
                    </div>
                  </div>

                  {/* Program Dates */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="text-slate-500 font-semibold">تاريخ التنفيذ:</div>
                    <div className="font-mono text-slate-700 font-semibold">
                      {prog.startDate} <span className="text-slate-300">إلى</span> {prog.endDate}
                    </div>
                  </div>

                  {/* Target Group details */}
                  <div className="text-[11px] text-slate-500 bg-emerald-50/40 p-2 rounded-lg border border-emerald-50 leading-relaxed">
                    <span className="font-semibold text-emerald-900 block mb-0.5">الفئة المستهدفة:</span>
                    <p className="line-clamp-2">{prog.targetGroup}</p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="border-t border-slate-50 bg-slate-50/70 py-2.5 px-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {prog.type} ({prog.organization})
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEdit(prog)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded shadow-sm hover:shadow transition"
                        title="تعديل البرنامج"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(prog)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-white rounded shadow-sm hover:shadow transition"
                        title="نسخ وتكرار"
                      >
                        <Copy size={13} />
                      </button>
                      {prog.status !== 'archived' && (
                        <button 
                          onClick={() => handleArchive(prog)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-white rounded shadow-sm hover:shadow transition"
                          title="أرشفة البرنامج"
                        >
                          <Archive size={13} />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف البرنامج: ${prog.name}؟ هذا الإجراء سيقوم أيضاً بحذف كافة المشاركين المسجلين به.`)) {
                            onDeleteProgram(prog.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-white rounded shadow-sm hover:shadow transition"
                        title="حذف البرنامج"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Model (Add/Edit Dialogue) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-base">
                  {editingProgram ? "تعديل بيانات البرنامج التدريبي" : "إضافة برنامج تدريبي جديد"}
                </h3>
                <p className="text-[10px] text-emerald-200 mt-0.5">يرجى ملء البيانات بدقة لضمان دقة إصدار وتوثيق الشهادات.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Program Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم/كود البرنامج التدريبي *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: TBC-2026-10"
                    required
                    value={programNumber}
                    onChange={(e) => setProgramNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 font-mono text-right"
                  />
                </div>

                {/* Program Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم البرنامج التدريبي التنموي *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: مهارات ريادة الأعمال الحديثة"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  />
                </div>

                {/* Program Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع البرنامج التدريبي *</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  >
                    <option value="حضورى">حضورى بالكامل</option>
                    <option value="عن بعد">عن بعد (منصة افتراضية)</option>
                    <option value="هجين">تعليم هجين (مشترك)</option>
                  </select>
                </div>

                {/* Trainer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدرب المعتمد *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: أ.د. بشير الفرجاني"
                    required
                    value={trainer}
                    onChange={(e) => setTrainer(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجهة المنفذة للتدريب *</label>
                  <input 
                    type="text" 
                    placeholder="مركز أعمال طرابلس"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  />
                </div>

                {/* Target Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المستهدفة برعاية البرنامج *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: أصحاب المشاريع الصغيرة والناشئة"
                    required
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  />
                </div>

                {/* Days & Hours */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عدد الأيام *</label>
                    <input 
                      type="number" 
                      min={1}
                      required
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عدد الساعات *</label>
                    <input 
                      type="number" 
                      min={1}
                      required
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 text-center"
                    />
                  </div>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحد الأقصى للمشاركين *</label>
                  <input 
                    type="number" 
                    min={1}
                    required
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 text-center"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة *</label>
                  <select 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  >
                    <option value="طرابلس">طرابلس</option>
                    <option value="بنغازي">بنغازي</option>
                    <option value="مصراتة">مصراتة</option>
                    <option value="الزاوية">الزاوية</option>
                    <option value="الخمس">الخمس</option>
                    <option value="سبها">سبها</option>
                    <option value="غريان">غريان</option>
                    <option value="طبرق">طبرق</option>
                    <option value="سرية">سرت</option>
                  </select>
                </div>

                {/* Implementation Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مكان التنفيذ بالتفصيل *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: القاعة الكبرى بنقابة المعلمين"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ البداية *</label>
                  <input 
                    type="date" 
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 font-mono"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ النهاية *</label>
                  <input 
                    type="date" 
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 font-mono"
                  />
                </div>

                {/* Program Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة البرنامج التدريبي الحالية *</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                  >
                    <option value="planning">مجدول وقيد التخطيط والتسجيل</option>
                    <option value="active">نشط وفعال حالياً (تحت التدريب)</option>
                    <option value="completed">مكتمل ومغلق (تم الانتهاء والامتحان)</option>
                    <option value="archived">مؤرشف ومخزن تاريخياً</option>
                  </select>
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وتفاصيل إضافية للبرنامج</label>
                <textarea 
                  rows={2}
                  placeholder="ملاحظات حول قاعة التدريب، المناهج التعليمية المطبقة أى استثناءات..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                >
                  {editingProgram ? "حفظ التغييرات" : "إضافة البرنامج"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
