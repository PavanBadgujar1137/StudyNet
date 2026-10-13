import React, { useState, useEffect, useRef } from 'react'
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiX,
  FiCalendar,
  FiFeather,
  FiSmile,
  FiUsers,
  FiBookOpen,
  FiExternalLink,
  FiRefreshCw,
} from 'react-icons/fi'

const NOTIF_ICONS = {
  session: <FiCalendar />,
  reflection: <FiFeather />,
  checkin: <FiSmile />,
  circle: <FiUsers />,
  course: <FiBookOpen />,
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkSingleRead,
  onDeleteNotification,
  onClearAll,
  onRestoreDefaultNotifications,
  onSelectNotification,
  theme = 'light',
}) {
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const dropdownRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose?.()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isDark = theme === 'dark'
  const filteredList =
    filter === 'unread'
      ? notifications.filter((n) => n.unread)
      : notifications

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: '0',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        background: isDark ? '#0F172A' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
        borderRadius: '16px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'}`,
        boxShadow: isDark
          ? '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'exactFadeSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px 12px',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: isDark ? '#0A0F1D' : '#F8FAFC',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              <FiBell />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800 }}>Notifications</span>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                title="Mark all as read"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#93C5FD' : '#2563EB',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                }}
              >
                <FiCheck size={14} /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              title="Close notifications"
              style={{
                background: 'transparent',
                border: 'none',
                color: isDark ? '#94A3B8' : '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px',
              }}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: filter === 'all'
                ? '1px solid #6366F1'
                : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'}`,
              background: filter === 'all'
                ? '#6366F1'
                : isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
              color: filter === 'all' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: filter === 'unread'
                ? '1px solid #6366F1'
                : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'}`,
              background: filter === 'unread'
                ? '#6366F1'
                : isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
              color: filter === 'unread' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div
        style={{
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '6px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {filteredList.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '32px' }}>🎉</span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>
              All caught up!
            </div>
            <div style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', maxWidth: '240px' }}>
              {filter === 'unread'
                ? 'You have read all incoming alerts and updates.'
                : 'No notifications at this moment.'}
            </div>
            {notifications.length === 0 && onRestoreDefaultNotifications && (
              <button
                onClick={onRestoreDefaultNotifications}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: isDark ? '#1E293B' : '#F1F5F9',
                  border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                  color: isDark ? '#93C5FD' : '#2563EB',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiRefreshCw size={12} /> Reset Notifications
              </button>
            )}
          </div>
        ) : (
          filteredList.map((notif) => {
            const icon = NOTIF_ICONS[notif.type] || <FiBell />
            return (
              <div
                key={notif.id}
                onClick={() => onSelectNotification?.(notif)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: notif.unread
                    ? isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(238, 242, 255, 0.7)'
                    : 'transparent',
                  border: `1px solid ${
                    notif.unread
                      ? isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(199, 210, 254, 0.6)'
                      : 'transparent'
                  }`,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!notif.unread) {
                    e.currentTarget.style.background = isDark ? '#1E293B' : '#F8FAFC'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!notif.unread) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {/* Category Icon */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: notif.bgColor || 'rgba(99, 102, 241, 0.15)',
                    color: notif.iconColor || '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: notif.unread ? 800 : 600,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        lineHeight: 1.3,
                      }}
                    >
                      {notif.title}
                    </div>
                    {notif.unread && (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#6366F1',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: isDark ? '#94A3B8' : '#64748B',
                      marginTop: '3px',
                      lineHeight: 1.4,
                    }}
                  >
                    {notif.message}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: isDark ? '#64748B' : '#94A3B8' }}>
                      {notif.time}
                    </span>

                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notif.unread && (
                        <button
                          onClick={() => onMarkSingleRead?.(notif.id)}
                          title="Mark as read"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isDark ? '#93C5FD' : '#3B82F6',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <FiCheck size={12} /> Read
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteNotification?.(notif.id)}
                        title="Delete notification"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isDark ? '#64748B' : '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          style={{
            padding: '10px 16px',
            borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? '#0A0F1D' : '#F8FAFC',
          }}
        >
          <button
            onClick={onClearAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#94A3B8' : '#64748B',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FiTrash2 size={12} /> Clear all
          </button>
          <span style={{ fontSize: '11px', color: isDark ? '#64748B' : '#94A3B8' }}>
            Click item to view section →
          </span>
        </div>
      )}
    </div>
  )
}
