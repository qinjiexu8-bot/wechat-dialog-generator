import { useRef, useState } from 'react';
import { Camera, Plus, Trash2, UserCheck, Users, X } from 'lucide-react';
import { getDefaultAvatar } from '@/lib/parser';
import type { ChatMode, ChatUser } from '@/types';

interface UserAvatarManagerProps {
  mode: ChatMode;
  users: ChatUser[];
  selfId: number | null;
  onAddUser: (name: string) => boolean;
  onUpdateName: (userId: number, name: string) => boolean;
  onUpdateAvatar: (userId: number, avatar: string) => void;
  onRemoveAvatar: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onSetSelf: (userId: number) => void;
}

function MemberCard({
  user,
  index,
  isSelf,
  onUpdateName,
  onUpdateAvatar,
  onRemoveAvatar,
  onDeleteUser,
  onSetSelf,
  allowDelete,
}: {
  user: ChatUser;
  index: number;
  isSelf: boolean;
  onUpdateName: (userId: number, name: string) => boolean;
  onUpdateAvatar: (userId: number, avatar: string) => void;
  onRemoveAvatar: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onSetSelf: (userId: number) => void;
  allowDelete: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarSrc = user.avatar || getDefaultAvatar(index);

  const commitName = (input: HTMLInputElement) => {
    if (input.value.trim() === user.name) return;
    if (!input.value.trim()) {
      input.value = user.name;
      onUpdateName(user.id, '');
      return;
    }
    if (!onUpdateName(user.id, input.value)) input.value = user.name;
    else input.value = input.value.trim();
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => onUpdateAvatar(user.id, loadEvent.target?.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className={`member-card ${isSelf ? 'is-self' : ''}`}>
      <button
        className="member-avatar"
        type="button"
        onClick={() => fileRef.current?.click()}
        title="更换头像"
      >
        <img src={avatarSrc} alt={`${user.name}的头像`} />
        <span className="member-avatar-action"><Camera size={16} /></span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />

      <div className="member-main">
        <div className="member-name-row">
          <input
            className="member-name-input"
            defaultValue={user.name}
            maxLength={20}
            aria-label={`编辑${user.name}的名称`}
            onBlur={event => commitName(event.currentTarget)}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') {
                event.currentTarget.value = user.name;
                event.currentTarget.blur();
              }
            }}
          />
          {isSelf && <span className="member-self-badge">我</span>}
        </div>
        <span className="member-meta">成员 {String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="member-actions">
        {user.avatar && (
          <button type="button" className="member-icon-btn" onClick={() => onRemoveAvatar(user.id)} title="恢复默认头像">
            <X size={15} />
          </button>
        )}
        {!isSelf && (
          <button type="button" className="member-icon-btn member-set-self" onClick={() => onSetSelf(user.id)} title="设为自己">
            <UserCheck size={16} />
          </button>
        )}
        {allowDelete && (
          <button type="button" className="member-icon-btn member-delete" onClick={() => onDeleteUser(user.id)} title="删除成员">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function UserAvatarManager({
  mode,
  users,
  selfId,
  onAddUser,
  onUpdateName,
  onUpdateAvatar,
  onRemoveAvatar,
  onDeleteUser,
  onSetSelf,
}: UserAvatarManagerProps) {
  const [newName, setNewName] = useState('');
  const isGroup = mode === 'group';

  const addMember = () => {
    if (!newName.trim()) return;
    if (onAddUser(newName)) setNewName('');
  };

  return (
    <section className="s-card member-manager">
      <div className="s-card-header">
        <div>
          <h2><Users size={20} /> {isGroup ? '群成员' : '聊天角色'}</h2>
          <p className="section-kicker">
            {isGroup ? '编辑成员身份，决定谁在群里发言' : '编辑双方名称与头像，并选择哪一方是自己'}
          </p>
        </div>
        <span className="s-card-badge">{users.length} 人</span>
      </div>
      <div className="s-card-body">
        <div className="member-list">
          {users.map((user, index) => (
            <MemberCard
              key={`${user.id}-${user.name}`}
              user={user}
              index={index}
              isSelf={user.id === selfId}
              onUpdateName={onUpdateName}
              onUpdateAvatar={onUpdateAvatar}
              onRemoveAvatar={onRemoveAvatar}
              onDeleteUser={onDeleteUser}
              onSetSelf={onSetSelf}
              allowDelete={isGroup}
            />
          ))}
        </div>

        {isGroup && (
          <div className="member-add-row">
            <input
              className="form-input"
              value={newName}
              maxLength={20}
              placeholder="输入新成员名称"
              aria-label="新成员名称"
              onChange={event => setNewName(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') addMember();
              }}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={addMember} disabled={!newName.trim()}>
              <Plus size={16} /> 添加成员
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
