
import React from 'react';
import { format, parseISO, isValid, subMinutes, subHours, subDays } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { Sparkles, Heart, BellRing, Home, User, Apple, Settings, LogOut, ChevronRight, Zap, Camera, Image as ImageIcon, Globe, Mic, X } from 'lucide-react';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import { CalendarEvent } from './types';
import { extractEventFromImage } from './services/geminiService';
import { GoogleGenAI, Type } from "@google/genai";

type Language = 'zh' | 'en';

const TRANSLATIONS = {
  zh: {
    title: '青苹果日历',
    subtitle: '每日开心一句',
    addEvent: '计划',
    me: '我',
    tipTitle: '时光贴士',
    tipContent: '点击日期上传图片，让 AI 捕捉灵感。🍎',
    analyzing: 'AI 捕捉中...',
    analyzingSub: '正在感受其中的清新气息 🍏✨',
    reminder: '要开始了!',
    noImage: '无法识别，请换个方式 📸',
    importAlbum: '相册导入',
    takePhoto: '拍摄照片',
    voiceInput: '语音输入',
    listening: '请说话...',
    profileName: '时光旅人',
    profileBadge: '高级会员 🍏',
    settingNotify: '提醒',
    settingPref: '偏好',
    settingFav: '收藏',
    settingLogout: '退出',
    energyTitle: '元气满满! 🍹',
    energyDesc: (count: number) => `本月已记录 ${count} 个瞬间。`,
    edition: 'Spring/Summer Edition',
    defaultQuote: '今天也要像苹果一样清脆乐观！'
  },
  en: {
    title: 'Lumina',
    subtitle: 'A Happy Daily Note',
    addEvent: 'Plans',
    me: 'Me',
    tipTitle: 'Golden Tip',
    tipContent: 'Upload a photo to let AI extract magic. 🍎',
    analyzing: 'AI Capturing...',
    analyzingSub: 'Feeling the fresh vibes 🍏✨',
    reminder: 'is starting!',
    noImage: 'Detection failed. Try another! 📸',
    importAlbum: 'Album',
    takePhoto: 'Camera',
    voiceInput: 'Voice Input',
    listening: 'Listening...',
    profileName: 'Time Traveler',
    profileBadge: 'Premium 🍏',
    settingNotify: 'Alerts',
    settingPref: 'Settings',
    settingFav: 'Favs',
    settingLogout: 'Logout',
    energyTitle: 'Stay Fresh! 🍹',
    energyDesc: (count: number) => `${count} moments captured.`,
    edition: 'Spring/Summer Edition',
    defaultQuote: 'Stay crisp and optimistic today!'
  }
};

const App: React.FC = () => {
  const [lang, setLang] = React.useState<Language>('zh');
  const [events, setEvents] = React.useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendar_events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = React.useState<'calendar' | 'profile'>('calendar');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<Partial<CalendarEvent>>({});
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [notifications, setNotifications] = React.useState<string[]>([]);
  const [showCameraMenu, setShowCameraMenu] = React.useState(false);
  const [dailyQuote, setDailyQuote] = React.useState({ zh: '', en: '' });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];

  const fetchDailyQuote = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a very short, optimistic, and beautiful daily quote. One sentence. Return JSON with 'zh' and 'en' keys.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              zh: { type: Type.STRING },
              en: { type: Type.STRING }
            },
            required: ["zh", "en"]
          }
        }
      });
      if (response.text) {
        setDailyQuote(JSON.parse(response.text));
      }
    } catch (e) {
      setDailyQuote({ zh: TRANSLATIONS.zh.defaultQuote, en: TRANSLATIONS.en.defaultQuote });
    }
  };

  const handleVoiceInput = () => {
    setShowCameraMenu(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Extract event details from this voice transcript: "${transcript}". Current date is ${format(new Date(), 'yyyy-MM-dd')}. Return JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                date: { type: Type.STRING },
                time: { type: Type.STRING },
                location: { type: Type.STRING },
                color: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                description: { type: Type.STRING },
                reminderType: { type: Type.STRING },
                reminderValue: { type: Type.NUMBER },
              },
              required: ["name", "date", "time", "location", "color", "duration"],
            }
          }
        });
        if (response.text) {
          const extracted = JSON.parse(response.text);
          setSelectedEvent({ ...extracted, id: undefined });
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.start();
  };

  React.useEffect(() => { fetchDailyQuote(); }, []);
  React.useEffect(() => { localStorage.setItem('calendar_events', JSON.stringify(events)); }, [events]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setShowCameraMenu(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const extracted = await extractEventFromImage(base64);
      if (extracted) {
        setSelectedEvent({ ...extracted, id: undefined });
        setIsModalOpen(true);
      } else {
        alert(t.noImage);
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveEvent = (newEvent: CalendarEvent) => {
    setEvents(prev => {
      const index = prev.findIndex(e => e.id === newEvent.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = newEvent;
        return updated;
      }
      return [...prev, newEvent];
    });
  };

  const displayQuote = dailyQuote[lang] || t.defaultQuote;

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdf2] font-sans selection:bg-lime-100">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />

      <main className="flex-1 pb-24 overflow-y-auto">
        {activeTab === 'calendar' ? (
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <header className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all hover:scale-105">
                   <Apple size={28} fill="white" />
                 </div>
                 <div className="flex flex-col">
                   <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight">{t.title}</h1>
                   <div className="flex items-center gap-1">
                      <p className="font-handwritten text-[10px] text-lime-600 leading-none whitespace-nowrap">
                        {displayQuote}
                      </p>
                      <Apple size={8} className="text-lime-500 fill-lime-500 flex-shrink-0" />
                   </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
                  className="px-2.5 py-1.5 bg-white border border-lime-100 rounded-xl text-slate-500 text-[9px] font-black hover:bg-lime-50 transition-colors shadow-sm"
                >
                  {lang === 'zh' ? 'EN' : '中文'}
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setShowCameraMenu(!showCameraMenu)}
                    className="p-2.5 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl text-white shadow-lg hover:scale-110 active:scale-90 transition-all"
                  >
                    <Camera size={20} />
                  </button>

                  {showCameraMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCameraMenu(false)} />
                      <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-lime-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-lime-50 transition-colors group">
                          <ImageIcon size={14} className="text-lime-500" />
                          <span className="text-[10px] font-black text-slate-700">{t.importAlbum}</span>
                        </button>
                        <button onClick={() => cameraInputRef.current?.click()} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-orange-50 transition-colors group">
                          <Camera size={14} className="text-orange-500" />
                          <span className="text-[10px] font-black text-slate-700">{t.takePhoto}</span>
                        </button>
                        <button onClick={handleVoiceInput} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-blue-50 transition-colors group">
                          <Mic size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black text-slate-700">{t.voiceInput}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            <div className="space-y-6">
              <Calendar events={events} onDateClick={(d) => { setSelectedEvent({date: format(d, 'yyyy-MM-dd'), time: '09:00', name: '', color: 'bg-lime-400'}); setIsModalOpen(true); }} onEventClick={(e) => { setSelectedEvent(e); setIsModalOpen(true); }} locale={lang === 'zh' ? zhCN : enUS} />
            </div>
            
            <div className="p-4 bg-gradient-to-br from-lime-50 to-orange-50 rounded-3xl border border-white shadow-sm flex items-start gap-3">
              <Sparkles size={14} className="text-lime-500 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-[8px] font-black text-lime-600 uppercase tracking-widest">{t.tipTitle}</h4>
                <p className="text-[10px] text-slate-600 font-bold">{t.tipContent}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-6 space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full border-2 border-white bg-gradient-to-br from-lime-400 to-yellow-400 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
                    <User size={36} className="text-slate-300" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-orange-400 text-white rounded-full border border-white shadow-lg">
                   <Apple size={10} fill="white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">{t.profileName}</h2>
                <p className="text-[8px] font-black text-lime-600 uppercase tracking-widest">{t.profileBadge}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-2 shadow-xl border border-orange-50">
              {[
                { icon: <BellRing size={16} />, label: t.settingNotify, color: 'text-orange-500 bg-orange-50' },
                { icon: <Settings size={16} />, label: t.settingPref, color: 'text-lime-600 bg-lime-50' },
                { icon: <Heart size={16} />, label: t.settingFav, color: 'text-rose-500 bg-rose-50' },
                { icon: <LogOut size={16} />, label: t.settingLogout, color: 'text-slate-400 bg-slate-50' },
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>{item.icon}</div>
                    <span className="font-bold text-slate-700 text-[11px]">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[200px] bg-white/95 backdrop-blur-2xl border border-lime-100/50 rounded-full p-1.5 flex items-center justify-between shadow-[0_20px_60px_rgba(132,204,22,0.15)] z-40 border-b-2">
        <button onClick={() => setActiveTab('calendar')} className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-all duration-300 ${activeTab === 'calendar' ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-md' : 'text-slate-400'}`}>
          <Home size={16} fill={activeTab === 'calendar' ? 'white' : 'transparent'} />
          <span className="text-[7px] font-black uppercase tracking-widest">{t.addEvent}</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-all duration-300 ${activeTab === 'profile' ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md' : 'text-slate-400'}`}>
          <User size={16} fill={activeTab === 'profile' ? 'white' : 'transparent'} />
          <span className="text-[7px] font-black uppercase tracking-widest">{t.me}</span>
        </button>
      </nav>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={saveEvent} onDelete={(id) => setEvents(prev => prev.filter(e => e.id !== id))} initialData={selectedEvent} lang={lang} />

      {isListening && (
        <div className="fixed inset-0 z-[70] bg-blue-900/10 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 text-center border-2 border-blue-50 animate-pulse">
            <Mic size={48} className="text-blue-500" />
            <h3 className="text-lg font-black text-slate-800">{t.listening}</h3>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-[60] bg-lime-900/10 backdrop-blur-xl flex items-center justify-center">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 text-center border-4 border-lime-50 max-w-xs w-full">
            <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-orange-500 rounded-3xl flex items-center justify-center animate-bounce">
              <Apple size={32} fill="white" />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{t.analyzing}</h3>
            <p className="text-[10px] text-slate-400 font-bold">{t.analyzingSub}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
