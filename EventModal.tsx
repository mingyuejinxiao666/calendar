
import React from 'react';
import { X, MapPin, Clock, Calendar as CalendarIcon, Type, Palette, Bell, Apple, Upload } from 'lucide-react';
import { CalendarEvent } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  onUploadRequest?: () => void;
  initialData: Partial<CalendarEvent>;
  lang: 'zh' | 'en';
}

const COLORS = [
  { label: 'Lime', value: 'bg-lime-400' },
  { label: 'Green', value: 'bg-green-400' },
  { label: 'Orange', value: 'bg-orange-400' },
  { label: 'Amber', value: 'bg-amber-400' },
  { label: 'Yellow', value: 'bg-yellow-400' },
  { label: 'Cyan', value: 'bg-sky-400' },
];

const MODAL_TRANS = {
  zh: {
    edit: '编辑计划',
    add: '新增计划',
    extract: '从照片自动提取',
    name: '事件名称',
    date: '日期',
    time: '时间',
    place: '地点',
    reminder: '提醒',
    theme: '主题配色',
    save: '保 存 计 划',
    delete: '删除',
    placeholderTitle: '去喝下午茶? 🍎🍹',
    placeholderPlace: '在哪里?',
    reminderTypes: { none: '无', minutes: '分钟', hours: '小时', days: '天' }
  },
  en: {
    edit: 'Edit Plan',
    add: 'New Plan',
    extract: 'Auto-extract from photo',
    name: 'Event Name',
    date: 'Date',
    time: 'Time',
    place: 'Location',
    reminder: 'Alert',
    theme: 'Theme Color',
    save: 'Save Plan',
    delete: 'Delete',
    placeholderTitle: 'Afternoon tea? 🍎🍹',
    placeholderPlace: 'Where to?',
    reminderTypes: { none: 'None', minutes: 'Min', hours: 'Hrs', days: 'Days' }
  }
};

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, onUploadRequest, initialData, lang }) => {
  const [formData, setFormData] = React.useState<Partial<CalendarEvent>>(initialData);
  const t = MODAL_TRANS[lang];

  React.useEffect(() => {
    setFormData({
      reminderType: 'none',
      reminderValue: 0,
      ...initialData
    });
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.date && formData.time) {
      onSave({
        ...formData,
        id: formData.id || Math.random().toString(36).substr(2, 9),
        color: formData.color || 'bg-lime-400',
        duration: formData.duration || 60,
        reminderType: formData.reminderType || 'none',
        reminderValue: formData.reminderValue || 0,
      } as CalendarEvent);
      onClose();
    }
  };

  const reminderOptions = Object.entries(t.reminderTypes).map(([key, label]) => ({
    value: key,
    label: label
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lime-900/10 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-lime-50">
        
        <div className="p-6 border-b border-lime-50 bg-gradient-to-r from-lime-50/50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl text-white shadow-lg shadow-lime-100">
                <Apple size={18} fill="white" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tighter">{formData.id ? t.edit : t.add}</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-lime-50 rounded-full text-slate-300 transition-colors">
              <X size={18} />
            </button>
          </div>

          {!formData.id && (
            <button 
              type="button"
              onClick={onUploadRequest}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-lime-200 hover:border-lime-500 hover:bg-lime-50 text-lime-600 font-black py-2.5 rounded-2xl transition-all text-[9px] uppercase tracking-widest"
            >
              <Upload size={14} /> {t.extract}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-lime-600 uppercase tracking-widest flex items-center gap-1">
              <Type size={10} /> {t.name}
            </label>
            <input 
              type="text" required value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-lime-200 outline-none font-black text-sm"
              placeholder={t.placeholderTitle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-lime-600 uppercase tracking-widest flex items-center gap-1"><CalendarIcon size={10} /> {t.date}</label>
              <input type="date" required value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-lime-200 outline-none font-black text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-lime-600 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {t.time}</label>
              <input type="time" required value={formData.time || ''} onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-lime-200 outline-none font-black text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-lime-600 uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {t.place}</label>
              <input type="text" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-lime-200 outline-none font-black text-xs"
                placeholder={t.placeholderPlace}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-lime-600 uppercase tracking-widest flex items-center gap-1"><Bell size={10} /> {t.reminder}</label>
              <div className="flex gap-1">
                <input type="number" min="0" value={formData.reminderValue || 0} onChange={e => setFormData({ ...formData, reminderValue: parseInt(e.target.value) })}
                  className="w-10 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-lime-200 outline-none font-black text-center text-xs"
                />
                <select value={formData.reminderType || 'none'} onChange={e => setFormData({ ...formData, reminderType: e.target.value as any })}
                  className="flex-1 px-1 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-lime-200 outline-none font-black text-[9px] appearance-none"
                >
                  {reminderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-lime-600 uppercase tracking-widest flex items-center gap-1"><Palette size={10} /> {t.theme}</label>
            <div className="flex justify-between bg-lime-50/30 p-2 rounded-xl border border-lime-100">
              {COLORS.map(c => (
                <button key={c.value} type="button" onClick={() => setFormData({ ...formData, color: c.value })}
                  className={`w-6 h-6 rounded-lg ${c.value} border-2 transition-all ${
                    formData.color === c.value ? 'border-white ring-2 ring-lime-100 scale-110 shadow-lg' : 'border-transparent opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button type="submit" className="flex-1 bg-gradient-to-br from-lime-400 to-green-500 text-white py-3.5 rounded-2xl shadow-xl transition-all active:scale-95 group relative overflow-hidden">
               <span className="relative z-10 font-wild text-lg tracking-wider drop-shadow-sm group-hover:scale-105 transition-transform inline-block">
                 {t.save}
               </span>
            </button>
            {formData.id && onDelete && (
              <button type="button" onClick={() => { onDelete(formData.id!); onClose(); }}
                className="px-4 py-3.5 bg-slate-50 text-slate-300 hover:text-rose-500 font-black rounded-2xl transition-all uppercase tracking-widest text-[8px]"
              >
                {t.delete}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
