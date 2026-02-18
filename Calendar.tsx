
import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  setMonth,
  setYear,
  getYear,
  getMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  locale: any;
}

const Calendar: React.FC<CalendarProps> = ({ events, onDateClick, onEventClick, locale }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);

  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const handleMonthSelect = (mIndex: number) => {
    setCurrentDate(setMonth(currentDate, mIndex));
    setShowMonthPicker(false);
  };

  const handleYearChange = (delta: number) => {
    setCurrentDate(setYear(currentDate, getYear(currentDate) + delta));
  };

  const monthNames = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => 
      format(setMonth(new Date(), i), 'MMM', { locale })
    );
  }, [locale]);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-lime-100/30 border border-lime-50 overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-br from-lime-50/50 via-white to-orange-50/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="text-xl font-black text-slate-800 hover:text-lime-500 flex items-center gap-2 group transition-colors"
            >
              {format(currentDate, 'MMMM', { locale })}
              <Settings2 size={16} className="text-lime-300 group-hover:rotate-90 transition-transform" />
            </button>
            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-3 p-3 bg-white rounded-3xl shadow-2xl border border-lime-50 grid grid-cols-3 gap-2 z-30 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                {monthNames.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => handleMonthSelect(i)}
                    className={`py-2.5 px-1 rounded-2xl text-xs font-black transition-all ${
                      getMonth(currentDate) === i 
                        ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-md' 
                        : 'hover:bg-lime-50 text-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative group flex items-center">
            <button onClick={() => handleYearChange(-1)} className="p-1 text-lime-200 hover:text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={16} />
            </button>
            <span className="text-base font-black text-lime-200 tracking-tight">{format(currentDate, 'yyyy')}</span>
            <button onClick={() => handleYearChange(1)} className="p-1 text-lime-200 hover:text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-white shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-lime-400 hover:text-white rounded-xl text-lime-400 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black text-slate-700 hover:bg-orange-400 hover:text-white rounded-xl transition-all">
            {locale.code === 'zh-CN' ? '今天' : 'Today'}
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-lime-400 hover:text-white rounded-xl text-lime-400 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="calendar-grid border-b border-lime-50 bg-white">
        {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
          const dayName = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'eeeeee', { locale, weekStartsOn: dayIdx });
          // Note: format with eeeee usually gives S, M, T... 
          // To ensure correct weekday labels based on start of week:
          const dayString = format(addMonths(startOfWeek(currentDate), 0).setDate(startOfWeek(currentDate).getDate() + dayIdx), 'eeeee', { locale });
          return (
            <div key={dayIdx} className={`py-3 text-center text-[10px] font-black uppercase tracking-widest ${dayIdx === 0 || dayIdx === 6 ? 'text-orange-300' : 'text-lime-300'}`}>
              {dayString}
            </div>
          );
        })}
      </div>

      {/* Grid Days */}
      <div className="calendar-grid">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div 
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-[90px] p-2.5 border-r border-b border-lime-50/40 transition-all cursor-pointer group hover:bg-white hover:z-10 hover:shadow-xl ${
                !isCurrentMonth ? 'bg-slate-50/30 grayscale-[0.8] opacity-40' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[12px] font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                  isToday 
                    ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-lg' 
                    : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && <div className="w-2 h-2 rounded-full bg-lime-400 mt-1 shadow-sm" />}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`${event.color} text-white text-[8px] p-1.5 rounded-lg truncate font-black shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    {event.name}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[8px] font-black text-lime-300 text-center">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
