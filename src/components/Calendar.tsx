import React, { useState } from "react";
import { TrainingProgram } from "../types";
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  BadgeHelp,
  Tag
} from "lucide-react";

interface CalendarProps {
  programs: TrainingProgram[];
}

export default function Calendar({ programs }: CalendarProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Use today as June 21, 2026 as per our standard app datetime
  const systemDate = new Date("2026-06-21");
  const [currentDate, setCurrentDate] = useState<Date>(systemDate);

  const monthsArabic = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const daysOfWeekArabic = ["الأحد", "الأثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  // Helper: Year & Month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Helper: days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day of month offset
  const getFirstDayOffset = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday etc. 
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOffset(currentYear, currentMonth);

  // Navigate month
  const nextMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === 'week') {
      const nextW = new Date(currentDate);
      nextW.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextW);
    } else {
      const nextD = new Date(currentDate);
      nextD.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextD);
    }
  };

  const prevMonth = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === 'week') {
      const prevW = new Date(currentDate);
      prevW.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevW);
    } else {
      const prevD = new Date(currentDate);
      prevD.setDate(currentDate.getDate() - 1);
      setCurrentDate(prevD);
    }
  };

  const resetToSystemDate = () => {
    setCurrentDate(new Date(systemDate));
  };

  // Match program based on date
  const getProgramsForDay = (day: number) => {
    const checkDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return programs.filter(p => {
      return p.startDate <= checkDateStr && p.endDate >= checkDateStr;
    });
  };

  const getProgramsForExactDate = (dateObject: Date) => {
    const y = dateObject.getFullYear();
    const m = String(dateObject.getMonth() + 1).padStart(2, '0');
    const d = String(dateObject.getDate()).padStart(2, '0');
    const checkDateStr = `${y}-${m}-${d}`;
    return programs.filter(p => {
      return p.startDate <= checkDateStr && p.endDate >= checkDateStr;
    });
  };

  // Status Badge visual styles
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-600 text-white border-blue-700";
      case "planning": return "bg-amber-500 text-white border-amber-600";
      case "completed": return "bg-sky-700 text-white border-sky-800";
      case "archived": return "bg-slate-500 text-white border-slate-600";
      default: return "bg-slate-500 text-white";
    }
  };

  // Day array for month grid
  const daysArray = [];
  // padding empty days
  for (let i = 0; i < firstDayOffset; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Week Grid logic
  const getWeekDates = () => {
    const dates = [];
    const temp = new Date(currentDate);
    // Find previous Sunday
    const day = temp.getDay();
    temp.setDate(temp.getDate() - day);
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6 animate-fade-in" id="calendar-module">
      {/* Calendar Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={24} />
            تقويم البرامج والأنشطة التدريبية
          </h2>
          <p className="text-xs text-slate-500">متابعة الفترات الزمنية للتدريب وجداول تنفيذ الدورات بالشهر والأسبوع واليوم.</p>
        </div>

        {/* View Mode controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button 
            onClick={() => setViewMode('month')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            عرض شهري
          </button>
          <button 
            onClick={() => setViewMode('week')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            عرض أسبوعي
          </button>
          <button 
            onClick={() => setViewMode('day')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'day' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            عرض يومي
          </button>
        </div>
      </div>

      {/* Date Navigation & Month Indicator */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <ChevronRight size={16} /> {/* RTL Right acts as previous */}
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <ChevronLeft size={16} /> {/* RTL Left acts as next */}
          </button>
          <button 
            onClick={resetToSystemDate}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            اليوم (21 يونيو 2026)
          </button>
        </div>

        <div className="text-sm sm:text-base font-bold text-blue-950 flex items-center gap-2">
          <span>{monthsArabic[currentMonth]} {currentYear}</span>
          {viewMode === 'week' && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
              أسبوع: {weekDates[0].getDate()} - {weekDates[6].getDate()} {monthsArabic[weekDates[6].getMonth()]}
            </span>
          )}
          {viewMode === 'day' && (
            <span className="text-xs bg-sky-100 text-sky-850 px-2 py-0.5 rounded-md font-semibold font-mono">
              الموافق: {currentDate.getDate()} {monthsArabic[currentDate.getMonth()]}
            </span>
          )}
        </div>

        {/* Legend block */}
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span>قيد التخطيط</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-650"></span>
            <span>برامج جارية (نشطة)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-sky-700"></span>
            <span>برامج مكتملة</span>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === "month" && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-500 text-xs py-2 bg-slate-50 rounded-lg">
            {daysOfWeekArabic.map((day, idx) => (
              <div key={idx} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={idx} className="bg-slate-50/40 min-h-24 rounded-xl border border-dashed border-slate-100 p-1"></div>
                );
              }

              const dayPrograms = getProgramsForDay(day);
              // Is this system date (June 21, 2026)?
              const isToday = currentYear === 2026 && currentMonth === 5 && day === 21;

              return (
                <div 
                  key={idx} 
                  className={`min-h-28 rounded-xl border p-2 flex flex-col justify-between transition-all duration-300 relative ${
                    isToday 
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold leading-none w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-blue-700 text-white' : 'text-slate-600'
                    }`}>
                      {day}
                    </span>
                    {dayPrograms.length > 0 && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                        {dayPrograms.length} {dayPrograms.length === 1 ? 'برنامج' : 'برامج'}
                      </span>
                    )}
                  </div>

                  {/* Day programs list */}
                  <div className="flex-1 mt-2 space-y-1.5 overflow-hidden max-h-20">
                    {dayPrograms.slice(0, 3).map((p) => (
                      <div 
                        key={p.id} 
                        className={`text-[9px] font-bold p-1 rounded border-r-2 truncate leading-tight shadow-sm cursor-help hover:opacity-90 ${getStatusColor(p.status)}`}
                        title={`[${p.programNumber}] ${p.name} - المدرب: ${p.trainer}`}
                      >
                        {p.name}
                      </div>
                    ))}
                    {dayPrograms.length > 3 && (
                      <div className="text-[8px] text-slate-400 text-center font-bold mt-1">
                        + {dayPrograms.length - 3} برامج إضافية
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-3">
            {weekDates.map((dateObj, idx) => {
              const dayPrograms = getProgramsForExactDate(dateObj);
              const isToday = dateObj.getFullYear() === 2026 && dateObj.getMonth() === 5 && dateObj.getDate() === 21;
              
              return (
                <div 
                  key={idx} 
                  className={`border rounded-2xl p-4 min-h-64 flex flex-col ${
                    isToday ? 'border-blue-600 bg-blue-50/20 shadow' : 'border-slate-100 bg-white'
                  }`}
                >
                  {/* Day Header */}
                  <div className="border-b border-slate-100 pb-3 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-500 block">{daysOfWeekArabic[dateObj.getDay()]}</span>
                    <span className={`inline-block text-base font-extrabold px-3 py-1 rounded-full ${
                      isToday ? 'bg-blue-800 text-white' : 'text-slate-800 bg-slate-100'
                    }`}>
                      {dateObj.getDate()}
                    </span>
                  </div>

                  {/* Content Programs */}
                  <div className="flex-1 mt-3 space-y-2.5">
                    {dayPrograms.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-300 text-[10px] text-center italic py-10">
                        لا توجد برامج مقررة اليوم
                      </div>
                    ) : (
                      dayPrograms.map((p) => (
                        <div 
                          key={p.id} 
                          className={`p-2.5 rounded-xl border border-l-4 shadow-sm space-y-1 relative group ${getStatusColor(p.status)}`}
                        >
                          <h4 className="text-[10px] font-bold leading-tight line-clamp-2">{p.name}</h4>
                          <div className="text-[9px] opacity-80 space-y-0.5 font-medium">
                            <p className="flex items-center gap-0.5"><Clock size={9} /> {p.hours} ساعة ({p.type})</p>
                            <p className="truncate"><User size={9} /> {p.trainer}</p>
                            <p className="truncate"><MapPin size={9} /> {p.city}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === "day" && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <div className="text-center max-w-sm mx-auto space-y-2 mb-6">
            <span className="text-xs bg-blue-800 text-white font-bold py-1 px-3 rounded-full">برامج اليوم الفعال</span>
            <h3 className="text-lg font-bold text-slate-800">
              {daysOfWeekArabic[currentDate.getDay()]}، {currentDate.getDate()} {monthsArabic[currentDate.getMonth()]} {currentYear}
            </h3>
            <p className="text-xs text-slate-500">مجموع البرامج التدريبية المخططة أو النشطة المنعقدة اليوم</p>
          </div>

          {getProgramsForExactDate(currentDate).length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-200">
              <BookOpen className="text-slate-300 mx-auto mb-2" size={32} />
              <p className="text-xs font-semibold text-slate-500">لا توجد أية أنشطة تدريبية مجدولة لهذا اليوم المحدد.</p>
              <button 
                onClick={resetToSystemDate}
                className="mt-3 text-xs text-blue-800 font-bold hover:underline"
              >
                العودة لتاريخ اليوم المعتمد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getProgramsForExactDate(currentDate).map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold font-mono">
                      {p.programNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(p.status)}`}>
                      {p.status === 'active' ? 'نشط حالياً' : p.status === 'planning' ? 'قيد التخطيط والتسجيل' : 'مكتمل ومغلق'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>

                  <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 font-semibold pt-2 border-t border-slate-50">
                    <p className="flex items-center gap-1"><Clock size={12} className="text-slate-400" /> {p.hours} ساعات تدريبية</p>
                    <p className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {p.city} - {p.location}</p>
                    <p className="flex items-center gap-1"><User size={12} className="text-slate-400" /> المدرب: {p.trainer}</p>
                    <p className="flex items-center gap-1"><Tag size={12} className="text-slate-400" /> نوع: {p.type}</p>
                  </div>

                  {p.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500 leading-relaxed border border-slate-100">
                      <span className="font-bold text-slate-800 block mb-0.5">ملاحظات الدورة:</span>
                      {p.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
