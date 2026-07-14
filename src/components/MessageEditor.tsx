import { useRef, useState } from 'react';
import { Banknote, Clock, Gift, Image, Mic, PlusCircle, Trash2, Type } from 'lucide-react';
import { getDefaultAvatar } from '@/lib/parser';
import type { ChatMessage, ChatMode, ChatUser, MessageType } from '@/types';

interface MessageEditorProps {
  mode: ChatMode;
  users: ChatUser[];
  messages: ChatMessage[];
  selfId: number | null;
  onAddMessage: (message: Omit<ChatMessage, 'id'>) => void;
  onDeleteMessage: (messageId: number) => void;
}

const MESSAGE_TYPES: { type: MessageType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: '文字', icon: <Type size={14} /> },
  { type: 'image', label: '图片', icon: <Image size={14} /> },
  { type: 'redpacket', label: '红包', icon: <Gift size={14} /> },
  { type: 'transfer', label: '转账', icon: <Banknote size={14} /> },
  { type: 'voice', label: '语音', icon: <Mic size={14} /> },
  { type: 'time', label: '时间', icon: <Clock size={14} /> },
];

const MESSAGE_TYPE_LABEL: Record<MessageType, string> = {
  text: '文字',
  image: '图片',
  redpacket: '红包',
  transfer: '转账',
  voice: '语音',
  time: '时间',
};

function getMessageSummary(message: ChatMessage): string {
  switch (message.type) {
    case 'text': return message.content;
    case 'image': return message.content ? '[图片]' : '[待上传图片]';
    case 'redpacket': return `[红包] ${message.params.remark || '恭喜发财，大吉大利'}`;
    case 'transfer': return `[转账] ¥${message.params.amount || '0'} ${message.params.remark || '转账'}`;
    case 'voice': return `[语音] ${message.params.duration || 3}秒`;
    case 'time': return message.content;
  }
}

export function MessageEditor({ mode, users, messages, selfId, onAddMessage, onDeleteMessage }: MessageEditorProps) {
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [senderId, setSenderId] = useState<number | ''>(selfId ?? users[0]?.id ?? '');
  const [textContent, setTextContent] = useState('');
  const [remark, setRemark] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('3');
  const [timeContent, setTimeContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const activeSenderId = users.some(user => user.id === senderId)
    ? senderId
    : selfId ?? users[0]?.id ?? '';

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = loadEvent => setImagePreview(loadEvent.target?.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAdd = () => {
    if (messageType === 'time') {
      if (!timeContent.trim()) return;
      onAddMessage({ type: 'time', senderId: selfId ?? users[0]?.id ?? 1, content: timeContent.trim(), params: {} });
      setTimeContent('');
      return;
    }

    if (!activeSenderId) return;

    switch (messageType) {
      case 'text':
        if (!textContent.trim()) return;
        onAddMessage({ type: 'text', senderId: activeSenderId, content: textContent.trim(), params: {} });
        setTextContent('');
        break;
      case 'image':
        onAddMessage({ type: 'image', senderId: activeSenderId, content: imagePreview || '', params: {} });
        setImagePreview(null);
        break;
      case 'redpacket':
        onAddMessage({ type: 'redpacket', senderId: activeSenderId, content: '', params: { remark: remark || '恭喜发财，大吉大利' } });
        setRemark('');
        break;
      case 'transfer':
        onAddMessage({ type: 'transfer', senderId: activeSenderId, content: '', params: { amount: amount || '0', remark: remark || '转账' } });
        setAmount('');
        setRemark('');
        break;
      case 'voice':
        onAddMessage({ type: 'voice', senderId: activeSenderId, content: '', params: { duration: parseInt(duration || '3', 10) } });
        setDuration('3');
        break;
    }
  };

  const renderFields = () => {
    if (messageType === 'time') {
      return (
        <input
          className="me-input"
          type="text"
          placeholder="如：7月14日 下午14:00"
          value={timeContent}
          onChange={event => setTimeContent(event.target.value)}
        />
      );
    }

    return (
      <>
        <div className="speaker-picker" role="listbox" aria-label="选择发言成员">
          {users.map((user, index) => (
            <button
              type="button"
              role="option"
              aria-selected={activeSenderId === user.id}
              key={user.id}
              className={`speaker-chip ${activeSenderId === user.id ? 'active' : ''}`}
              onClick={() => setSenderId(user.id)}
            >
              <img src={user.avatar || getDefaultAvatar(index)} alt="" />
              <span>{user.name}</span>
              {user.id === selfId && <small>我</small>}
            </button>
          ))}
        </div>

        {messageType === 'text' && (
          <textarea
            className="me-textarea"
            placeholder="输入这位成员要说的话…"
            value={textContent}
            onChange={event => setTextContent(event.target.value)}
            rows={3}
          />
        )}

        {messageType === 'image' && (
          <div className="me-img-area">
            {imagePreview ? (
              <div className="me-img-preview">
                <img src={imagePreview} alt="待发送" />
                <button type="button" className="me-img-remove" onClick={() => setImagePreview(null)}>✕</button>
              </div>
            ) : (
              <button type="button" className="me-img-upload" onClick={() => imageInputRef.current?.click()}>
                <Image size={20} /><span>选择图片</span>
              </button>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
          </div>
        )}

        {messageType === 'redpacket' && (
          <input className="me-input" type="text" placeholder="红包备注" value={remark} onChange={event => setRemark(event.target.value)} />
        )}

        {messageType === 'transfer' && (
          <div className="me-row">
            <input className="me-input" type="number" min="0" step="0.01" placeholder="金额" value={amount} onChange={event => setAmount(event.target.value)} />
            <input className="me-input me-input-wide" type="text" placeholder="转账备注" value={remark} onChange={event => setRemark(event.target.value)} />
          </div>
        )}

        {messageType === 'voice' && (
          <div className="me-row me-duration-row">
            <input className="me-input" type="number" min={1} max={60} value={duration} onChange={event => setDuration(event.target.value)} />
            <span className="me-hint">秒</span>
          </div>
        )}
      </>
    );
  };

  const recentMessages = messages.slice(-8).reverse();

  return (
    <section className="s-card message-workbench">
      <div className="s-card-header">
        <div>
          <h2><PlusCircle size={20} /> {mode === 'group' ? '群聊发言' : '私聊发言'}</h2>
          <p className="section-kicker">选择发言身份，再添加一条{mode === 'group' ? '群' : '私聊'}消息</p>
        </div>
        <span className="s-card-badge">{messages.length} 条</span>
      </div>
      <div className="s-card-body message-compose">
        <div className="me-type-tabs">
          {MESSAGE_TYPES.map(item => (
            <button
              type="button"
              key={item.type}
              className={`me-type-tab ${messageType === item.type ? 'active' : ''}`}
              onClick={() => setMessageType(item.type)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {renderFields()}

        <button type="button" className="btn btn-primary message-send-button" onClick={handleAdd} disabled={users.length === 0}>
          <PlusCircle size={16} /> 添加到{mode === 'group' ? '群聊' : '私聊'}
        </button>

        {recentMessages.length > 0 && (
          <div className="message-history">
            <div className="message-history-head">
              <strong>最近消息</strong>
              <span>可删除误添加的发言</span>
            </div>
            {recentMessages.map(message => {
              const userIndex = users.findIndex(user => user.id === message.senderId);
              const user = users[userIndex];
              return (
                <div className="message-history-item" key={message.id}>
                  {message.type === 'time' ? (
                    <span className="message-history-icon"><Clock size={15} /></span>
                  ) : (
                    <img src={user?.avatar || getDefaultAvatar(Math.max(userIndex, 0))} alt="" />
                  )}
                  <div className="message-history-content">
                    <div><strong>{message.type === 'time' ? '时间节点' : user?.name || '未知成员'}</strong><small>{MESSAGE_TYPE_LABEL[message.type]}</small></div>
                    <p>{getMessageSummary(message)}</p>
                  </div>
                  <button type="button" className="message-delete-button" onClick={() => onDeleteMessage(message.id)} title="删除这条消息">
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
