import React, { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { useTranslation } from '@shared/i18n/useTranslation.js';
import './ChatWidget.css';

const ChatWidget = ({ isOpen: initialOpen = true }) => {
  const { t } = useTranslation();
  const [chatOpen, setChatOpen] = useState(initialOpen);

  return (
    <div className="horizon-chat-widget">
      {chatOpen && (
        <div className="horizon-chat-widget__bubble">
          <span>{t('chat.greeting')}</span>
          <button type="button" onClick={() => setChatOpen(false)} aria-label={t('common.close')}>
            x
          </button>
        </div>
      )}
      <button
        type="button"
        className="horizon-chat-widget__btn"
        aria-label={t('chat.title')}
        onClick={() => setChatOpen(true)}
      >
        <FiMessageCircle size={22} />
      </button>
    </div>
  );
};

export default ChatWidget;
