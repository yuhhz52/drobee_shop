import React, { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import './ChatWidget.css';

const ChatWidget = ({ isOpen: initialOpen = true }) => {
  const [chatOpen, setChatOpen] = useState(initialOpen);

  return (
    <div className="horizon-chat-widget">
      {chatOpen && (
        <div className="horizon-chat-widget__bubble">
          <span>Hi! Need any help?</span>
          <button type="button" onClick={() => setChatOpen(false)} aria-label="Close">
            x
          </button>
        </div>
      )}
      <button
        type="button"
        className="horizon-chat-widget__btn"
        aria-label="Chat"
        onClick={() => setChatOpen(true)}
      >
        <FiMessageCircle size={22} />
      </button>
    </div>
  );
};

export default ChatWidget;
