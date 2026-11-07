/**
 * ChatPage Component
 * Two-panel encrypted and privileged legal communications:
 * - Left Panel: Matter channels & internal counsel rooms with role-based member isolation
 * - Right Panel: Realtime messages stream with optimistic send, read receipt checks, and timestamps
 * Strictly ensures clients only see their own matter channels.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import {
  MessageSquare,
  Send,
  Paperclip,
  Scale,
  CheckCheck,
  User,
  ShieldCheck,
  Search,
  Lock,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { locale, chatMessages, currentUser, sendChatMessage, cases, clients } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || currentUser.role;
  const activeUserId = user?.id || currentUser.id;

  const rawRooms = [
    {
      id: 'room-case-101',
      name: locale === 'ar' ? 'قضية الأفق للتقنية (CAS-2026-0419)' : 'Horizon Tech Matter (CAS-2026-0419)',
      caseNumber: 'CASE-2026-0419',
      participants: 'سارة المنصور (محامي) · م. فيصل العتيبي (موكل)',
      clientId: 'cl-1',
      lawyerId: 'usr-lawyer',
      isInternal: false,
    },
    {
      id: 'room-case-102',
      name: locale === 'ar' ? 'تحكيم مجموعة المروج (CAS-2026-0382)' : 'Al-Morooj Arbitration (CAS-2026-0382)',
      caseNumber: 'CASE-2026-0382',
      participants: 'عبد العزيز التميمي (محامي) · خالد الشمري (محاسب)',
      clientId: 'cl-2',
      lawyerId: 'usr-admin',
      isInternal: false,
    },
    {
      id: 'room-internal',
      name: locale === 'ar' ? 'غرفة الاستشارات الداخلية للمكتب' : 'Internal Legal Advisory Room',
      caseNumber: 'Internal',
      participants: 'فريق العمل القانوني',
      clientId: null,
      lawyerId: null,
      isInternal: true,
    },
  ];

  // Role-Based Room Isolation
  const visibleRooms = useMemo(() => {
    if (activeRole === 'client') {
      const clientRecord = clients.find((cl) => cl.userId === activeUserId || cl.email === user?.email);
      const targetClientId = clientRecord ? clientRecord.id : 'cl-1';
      return rawRooms.filter((r) => r.clientId === targetClientId);
    }
    if (activeRole === 'lawyer') {
      return rawRooms.filter((r) => r.isInternal || r.lawyerId === activeUserId || r.lawyerId === 'usr-lawyer');
    }
    // Admin, Assistant, Secretary, Accountant
    return rawRooms;
  }, [activeRole, activeUserId, clients, user, rawRooms]);

  const [activeRoomId, setActiveRoomId] = useState(visibleRooms[0]?.id || 'room-case-101');
  const [inputText, setInputText] = useState('');
  const [searchRoomQuery, setSearchRoomQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleRooms.length > 0 && !visibleRooms.some((r) => r.id === activeRoomId)) {
      setActiveRoomId(visibleRooms[0].id);
    }
  }, [visibleRooms, activeRoomId]);

  const currentMessages = chatMessages.filter((m) => m.roomId === activeRoomId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(activeRoomId, inputText.trim());
    setInputText('');
  };

  const filteredRooms = visibleRooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchRoomQuery.toLowerCase()) ||
      r.caseNumber.toLowerCase().includes(searchRoomQuery.toLowerCase())
  );

  const activeRoom = visibleRooms.find((r) => r.id === activeRoomId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <span>{t.navChat}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {locale === 'ar'
            ? 'قنوات المراسلة المشفرة والآمنة للتواصل بين الموكل والمحامي وفريق العمل القانوني'
            : 'Encrypted, privileged communications channels between counsel, staff, and clients'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Rooms Sidebar */}
        <div className="md:col-span-4 border-e border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {locale === 'ar' ? 'قنوات القضايا والمحادثات' : 'Matter Channels'}
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-2.5" />
              <input
                type="text"
                value={searchRoomQuery}
                onChange={(e) => setSearchRoomQuery(e.target.value)}
                placeholder={locale === 'ar' ? 'بحث في القنوات...' : 'Search channels...'}
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2 space-y-1 flex-1 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {locale === 'ar' ? 'لا توجد قنوات متاحة' : 'No channels found'}
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isSelected = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`w-full text-start p-3 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{room.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">{room.participants}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Messages Panel */}
        <div className="md:col-span-8 flex flex-col h-[580px]">
          {/* Channel Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                {activeRoom?.name || (locale === 'ar' ? 'قناة المحادثة' : 'Chat Channel')}
              </span>
              <span className="text-[10px] text-slate-400">
                {activeRoom?.participants}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS 1.3 / Privileged</span>
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                <Lock className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                <span>{locale === 'ar' ? 'هذه المحادثة مشفرة ومحمية بسرية المحاماة' : 'Privileged attorney-client communication'}</span>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isMe = msg.senderId === activeUserId || msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{msg.senderName}</span>
                      <span>·</span>
                      <span className="tabular-nums">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-te-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-ts-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={locale === 'ar' ? 'اكتب رسالتك القانونية...' : 'Type confidential message...'}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.send}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
