'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, type Notification } from '@/lib/notifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  // Refresh on open
  useEffect(() => {
    if (isOpen) {
      setNotifications(getNotifications());
      setUnreadCount(getUnreadCount());
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications(getNotifications());
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsOpen(false);
  };

  const handleMarkOneRead = (e: React.MouseEvent, notif: Notification) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead(notif.id);
    setNotifications(getNotifications());
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const typeIcon: Record<string, string> = {
    donation: '💰',
    new_campaign: '🚀',
    milestone: '🎯',
    community_milestone: '🏆',
    follow: '👤',
    recommendation: '✨',
    update: '📝',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-[#00b964] hover:text-[#009e54] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <Link
                  key={notif.id}
                  href={notif.link || '#'}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    !notif.read ? 'bg-[#00b964]/5' : ''
                  }`}>
                    {/* Avatar or icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {notif.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                          <Image src={notif.avatar} alt="" width={40} height={40} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                          {typeIcon[notif.type] || '🔔'}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        <span className="font-semibold">{notif.title}</span>
                        {' '}
                        <span className="text-gray-500">{notif.message}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatNotifTime(notif.timestamp)}
                      </p>
                    </div>

                    {/* Mark as read button */}
                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkOneRead(e, notif)}
                        className="flex-shrink-0 mt-1 p-1 rounded-full hover:bg-[#00b964]/10 transition-colors group"
                        title="Mark as read"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00b964] group-hover:scale-125 transition-transform" />
                      </button>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatNotifTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
