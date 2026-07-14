import { useEffect, useRef } from 'react';
import { getDefaultAvatar } from '@/lib/parser';
import type { ChatMessage, ChatMode, ChatUser, PhoneSettings } from '@/types';
import './PhonePreview.css';

interface PhonePreviewProps {
  mode: ChatMode;
  users: ChatUser[];
  messages: ChatMessage[];
  settings: PhoneSettings;
  selfId: number | null;
  phoneRef?: React.RefObject<HTMLDivElement | null>;
  onUpdateMessage?: (messageId: number, content: string) => void;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function SilentIcon() {
  return (
    <svg className="wc-silent-icon" viewBox="0 0 48 50" aria-hidden="true">
      <defs>
        <mask id="wc-silent-cut">
          <rect width="48" height="50" fill="#fff" />
          <path d="M2 4L46 46" stroke="#000" strokeWidth="10" strokeLinecap="round" />
        </mask>
      </defs>
      <g mask="url(#wc-silent-cut)" fill="#000">
        <path d="M14 10C14 3 19 0 24 0C30 0 35 5 35 12C43 16 45 23 45 31V34L48 40H0L7 33V23C7 17 9 13 14 10Z" />
        <ellipse cx="23" cy="46.5" rx="7" ry="3" />
      </g>
      <path d="M2 4L46 46" fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function CellularIcon({ bars, dual }: { bars: number; dual: boolean }) {
  const fill = (index: number) => bars >= index ? '#000' : '#a8a8aa';
  if (!dual) {
    return (
      <svg className="wc-cellular-icon" viewBox="0 0 58 41" aria-label="单卡信号">
        <rect x="0" y="29" width="10" height="12" rx="3" fill={fill(1)} />
        <rect x="16" y="20" width="10" height="21" rx="3" fill={fill(2)} />
        <rect x="32" y="10" width="10" height="31" rx="3" fill={fill(3)} />
        <rect x="48" y="0" width="10" height="41" rx="3" fill={fill(4)} />
      </svg>
    );
  }
  return (
    <svg className="wc-cellular-icon" viewBox="0 0 58 41" aria-label="双卡信号">
      <rect x="0" y="13" width="10" height="12" rx="3" fill={fill(1)} />
      <rect x="16" y="10" width="10" height="15" rx="3" fill={fill(2)} />
      <rect x="32" y="5" width="10" height="20" rx="3" fill={fill(3)} />
      <rect x="48" y="0" width="10" height="25" rx="3" fill={fill(4)} />
      {[0, 16, 32, 48].map((x, index) => (
        <rect key={x} x={x} y="30" width="10" height="11" rx="3" fill={fill(index + 1)} />
      ))}
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg className="wc-wifi-icon" viewBox="0 0 49 37" fill="none" aria-hidden="true">
      <path d="M3 12C14-1 35-1 46 12" stroke="#000" strokeWidth="7" strokeLinecap="round" />
      <path d="M11 22C18 15 31 15 38 22" stroke="#000" strokeWidth="7" strokeLinecap="round" />
      <path d="M16 29C18.5 25 29.5 25 32 29C29.5 32 26.5 35 24 37C21.5 35 18.5 32 16 29Z" fill="#000" />
    </svg>
  );
}

function BatteryIcon({ battery }: { battery: number }) {
  const safeBattery = Math.min(100, Math.max(0, battery));
  const low = safeBattery <= 20;
  return (
    <div className={`wc-ios-battery ${low ? 'is-low' : ''}`} aria-label={`电量${safeBattery}%`}>
      <div className="wc-ios-battery-shell">
        <span className="wc-ios-battery-fill" style={{ width: `${safeBattery}%` }} />
        <strong>{safeBattery}</strong>
      </div>
      <i />
    </div>
  );
}

function TimeNotice({ content }: { content: string }) {
  return <div className="wc-notice"><span className="wc-notice-bg">{content}</span></div>;
}

function ChatBubble({
  message,
  user,
  userIndex,
  isSelf,
  isGroup,
  selfColor,
  otherColor,
  onUpdateMessage,
}: {
  message: ChatMessage;
  user: ChatUser;
  userIndex: number;
  isSelf: boolean;
  isGroup: boolean;
  selfColor: string;
  otherColor: string;
  onUpdateMessage?: (messageId: number, content: string) => void;
}) {
  const avatarSrc = user.avatar || getDefaultAvatar(userIndex);
  const bubbleColor = isSelf ? selfColor : otherColor;
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUpdateMessage) return;
    const reader = new FileReader();
    reader.onload = loadEvent => onUpdateMessage(message.id, loadEvent.target?.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="wc-bubble" style={{ background: bubbleColor }}>
            <span className="wc-arrow" style={{ background: bubbleColor }} />
            <span dangerouslySetInnerHTML={{ __html: escapeHtml(message.content).replace(/\n/g, '<br>') }} />
          </div>
        );
      case 'image': {
        const hasImage = message.content && !message.content.includes('placeholder');
        return (
          <div className="wc-bubble wc-bubble-image" onClick={() => imageInputRef.current?.click()}>
            {hasImage ? (
              <img src={message.content} alt="" />
            ) : (
              <div className="wc-img-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="#999" stroke="none" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>点击上传图片</span>
              </div>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </div>
        );
      }
      case 'voice': {
        const duration = message.params.duration || 2;
        const width = 190 + Math.min(duration * 30, 400);
        const barCount = Math.min(Math.max(3, Math.floor(duration / 1.5)), 8);
        const bars = Array.from({ length: barCount }, (_, index) => (
          <span key={index} style={{ height: `${12 + Math.round((index / barCount) * 30)}px` }} />
        ));
        return (
          <div className="wc-bubble wc-bubble-voice" style={{ background: bubbleColor, width: `${width}px`, flexDirection: isSelf ? 'row-reverse' : 'row' }}>
            <span className="wc-arrow" style={{ background: bubbleColor }} />
            {isSelf
              ? <><span className="wc-voice-dur">{duration}&quot;</span><div className="wc-voice-bars">{bars}</div></>
              : <><div className="wc-voice-bars">{bars}</div><span className="wc-voice-dur">{duration}&quot;</span></>}
          </div>
        );
      }
      case 'redpacket':
        return (
          <div className="wc-bubble wc-bubble-redpacket">
            <span className="wc-arrow" style={{ background: '#f79c46' }} />
            <div className="wc-rp-content">
              <div className="wc-rp-icon">🧧</div>
              <div className="wc-rp-info"><span>{message.params.remark || '恭喜发财，大吉大利'}</span></div>
            </div>
            <div className="wc-rp-bottom"><span>微信红包</span></div>
          </div>
        );
      case 'transfer':
        return (
          <div className="wc-bubble wc-bubble-transfer">
            <span className="wc-arrow" style={{ background: '#f79c46' }} />
            <div className="wc-rp-content">
              <div className="wc-rp-icon">¥</div>
              <div className="wc-rp-info">
                <span>¥{parseFloat(message.params.amount || '0').toFixed(2)}</span>
                <small>{message.params.remark || '转账'}</small>
              </div>
            </div>
            <div className="wc-rp-bottom"><span>微信转账</span></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`wc-dialog ${isSelf ? 'wc-dialog-right' : ''}`}>
      <div className="wc-face"><img src={avatarSrc} alt={user.name} /></div>
      <div className="wc-body">
        {!isSelf && isGroup && <div className="wc-nick">{user.name}</div>}
        {renderContent()}
      </div>
    </div>
  );
}

export function PhonePreview({ mode, users, messages, settings, selfId, phoneRef, onUpdateMessage }: PhonePreviewProps) {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  const isGroup = mode === 'group';
  const title = isGroup
    ? `${settings.contactName.trim() || '群聊'} (${users.length})`
    : settings.contactName.trim() || users.find(user => user.id !== selfId)?.name || '对方';
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor,
    backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
  };

  return (
    <div className="wc-phone-scale-wrap">
      <div className="wc-phone-wrap">
        <div className="wc-phone-content">
          <div className="wc-phone" ref={phoneRef} style={{ backgroundColor: settings.backgroundColor }}>
            <div className="wc-phone-top">
              <div className="wc-status-bar">
                <div className="wc-status-left">
                  <span className="wc-time">{settings.time}</span>
                  {settings.isMuted && <SilentIcon />}
                </div>
                <div className="wc-status-right">
                  <CellularIcon bars={settings.signal} dual={settings.isDualSim} />
                  {settings.isWifiEnabled && <WifiIcon />}
                  <BatteryIcon battery={settings.battery} />
                </div>
              </div>
              <div className="wc-nav">
                <div className="wc-nav-left">
                  <svg className="wc-back-icon" viewBox="0 0 30 54" fill="none" aria-hidden="true">
                    <path d="M27 3L4 27l23 24" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {settings.unreadCount > 0 && <span className="wc-nav-badge">{settings.unreadCount}</span>}
                </div>
                <div className="wc-nav-center"><span>{title}</span></div>
                <div className="wc-nav-right"><div className="wc-nav-dots"><i /><i /><i /></div></div>
              </div>
            </div>

            <div className="wc-chat-body" ref={bodyRef} style={backgroundStyle}>
              <div className="wc-chat-content">
                {messages.map(message => {
                  if (message.type === 'time') return <TimeNotice key={message.id} content={message.content} />;
                  const userIndex = users.findIndex(user => user.id === message.senderId);
                  const user = users[userIndex] || users[0];
                  if (!user) return null;
                  return (
                    <ChatBubble
                      key={message.id}
                      message={message}
                      user={user}
                      userIndex={Math.max(userIndex, 0)}
                      isSelf={message.senderId === selfId}
                      isGroup={isGroup}
                      selfColor={settings.selfBubbleColor}
                      otherColor={settings.otherBubbleColor}
                      onUpdateMessage={onUpdateMessage}
                    />
                  );
                })}
              </div>
            </div>

            <div className="wc-bottom">
              <div className="wc-bottom-chat">
                <div className="wc-bottom-inner">
                  <div className="wc-bottom-icon"><img src={`${import.meta.env.BASE_URL}wechat-bottom-icon1.png`} alt="语音" /></div>
                  <div className="wc-input-box" />
                  <div className="wc-bottom-icon"><img src={`${import.meta.env.BASE_URL}wechat-bottom-icon2.png`} alt="表情" /></div>
                  <div className="wc-bottom-icon"><img src={`${import.meta.env.BASE_URL}wechat-bottom-icon3.png`} alt="加号" /></div>
                </div>
              </div>
              <div className="wc-home-indicator"><i /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
