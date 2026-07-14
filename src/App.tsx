import { useCallback, useRef, useState } from 'react';
import { toCanvas } from 'html-to-image';
import { Copy, Download, Image as ImageIcon, MessageSquare, RotateCcw, UserRound, UsersRound } from 'lucide-react';
import { ImportPanel } from '@/components/ImportPanel';
import { MessageEditor } from '@/components/MessageEditor';
import { PhonePreview } from '@/components/PhonePreview';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UserAvatarManager } from '@/components/UserAvatarManager';
import { renderReferenceChrome } from '@/lib/exportRenderer';
import { parseChatRecord } from '@/lib/parser';
import type { ChatMessage, ChatMode, ChatWorkspace, PhoneSettings } from '@/types';

const PRIVATE_WORKSPACE: ChatWorkspace = {
  users: [
    { id: 1, name: '我', avatar: null },
    { id: 2, name: '张三', avatar: null },
  ],
  messages: [
    { id: 1, type: 'text', senderId: 2, content: '请你下午去雪野吃饭', params: {} },
    { id: 2, type: 'text', senderId: 1, content: '啊', params: {} },
    { id: 3, type: 'time', senderId: 1, content: '10:06', params: {} },
    { id: 4, type: 'text', senderId: 2, content: '去不去', params: {} },
    { id: 5, type: 'text', senderId: 1, content: '你说啥事', params: {} },
    { id: 6, type: 'text', senderId: 2, content: '没事，', params: {} },
    { id: 7, type: 'text', senderId: 1, content: '我不去了，我还得接孩子', params: {} },
    { id: 8, type: 'text', senderId: 2, content: '下午去吃饭，吃了饭回来', params: {} },
  ],
  settings: {
    time: '10:17',
    signal: 4,
    battery: 17,
    contactName: '张三',
    unreadCount: 64,
    selfBubbleColor: '#95ec69',
    otherBubbleColor: '#ffffff',
    isMuted: true,
    isWifiEnabled: true,
    isDualSim: true,
    backgroundColor: '#f8f8ef',
    backgroundImage: null,
  },
  selfId: 1,
  importText: '',
};

const GROUP_WORKSPACE: ChatWorkspace = {
  users: [
    { id: 1, name: '张伟', avatar: null },
    { id: 2, name: '李娜', avatar: null },
    { id: 3, name: '王芳', avatar: null },
  ],
  messages: [
    { id: 1, type: 'time', senderId: 1, content: '7月14日 下午14:00', params: {} },
    { id: 2, type: 'text', senderId: 1, content: '周末大家有空吗？一起去露营吧', params: {} },
    { id: 3, type: 'text', senderId: 2, content: '我可以！正好想去郊外走走', params: {} },
    { id: 4, type: 'text', senderId: 3, content: '算我一个，我来准备吃的～', params: {} },
  ],
  settings: {
    time: '10:17',
    signal: 4,
    battery: 60,
    contactName: '周末搭子',
    unreadCount: 3,
    selfBubbleColor: '#95ec69',
    otherBubbleColor: '#ffffff',
    isMuted: false,
    isWifiEnabled: true,
    isDualSim: true,
    backgroundColor: '#ededed',
    backgroundImage: null,
  },
  selfId: 1,
  importText: '',
};

function cloneWorkspace(workspace: ChatWorkspace): ChatWorkspace {
  return {
    ...workspace,
    users: workspace.users.map(user => ({ ...user })),
    messages: workspace.messages.map(message => ({ ...message, params: { ...message.params } })),
    settings: { ...workspace.settings },
  };
}

function App() {
  const [chatMode, setChatMode] = useState<ChatMode>('private');
  const [workspaces, setWorkspaces] = useState<Record<ChatMode, ChatWorkspace>>({
    private: cloneWorkspace(PRIVATE_WORKSPACE),
    group: cloneWorkspace(GROUP_WORKSPACE),
  });
  const [toast, setToast] = useState('');
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = workspaces[chatMode];
  const exportTitle = chatMode === 'group'
    ? `${active.settings.contactName.trim() || '群聊'} (${active.users.length})`
    : active.settings.contactName.trim() || active.users.find(user => user.id !== active.selfId)?.name || '对方';

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }, []);

  const updateActive = useCallback((updater: (workspace: ChatWorkspace) => ChatWorkspace) => {
    setWorkspaces(previous => ({ ...previous, [chatMode]: updater(previous[chatMode]) }));
  }, [chatMode]);

  const handleImport = useCallback(() => {
    if (!active.importText.trim()) {
      showToast('请先输入聊天记录文本');
      return;
    }
    const result = parseChatRecord(active.importText);
    if (result.messages.length === 0 || result.users.length === 0) {
      showToast('未解析到有效的聊天成员和消息');
      return;
    }
    if (chatMode === 'private' && result.users.length !== 2) {
      showToast('私聊模式需要恰好两位聊天角色');
      return;
    }
    if (chatMode === 'group' && result.users.length < 2) {
      showToast('群聊模式至少需要两位成员');
      return;
    }

    const selfId = result.users[0]?.id ?? null;
    let contactName = result.users[1]?.name || result.users[0]?.name || '聊天';
    if (chatMode === 'group') {
      const otherNames = result.users.slice(1).map(user => user.name);
      contactName = otherNames.length <= 3
        ? otherNames.join('、')
        : `${otherNames.slice(0, 2).join('、')}等`;
    }
    updateActive(workspace => ({
      ...workspace,
      users: result.users,
      messages: result.messages,
      selfId,
      settings: { ...workspace.settings, contactName: contactName || (chatMode === 'group' ? '群聊' : '对方') },
    }));
    showToast(`成功导入 ${result.messages.length} 条消息（${result.users.length} 人）`);
  }, [active.importText, chatMode, showToast, updateActive]);

  const handleUpdateAvatar = useCallback((userId: number, avatar: string) => {
    updateActive(workspace => ({
      ...workspace,
      users: workspace.users.map(user => user.id === userId ? { ...user, avatar } : user),
    }));
  }, [updateActive]);

  const handleRemoveAvatar = useCallback((userId: number) => {
    updateActive(workspace => ({
      ...workspace,
      users: workspace.users.map(user => user.id === userId ? { ...user, avatar: null } : user),
    }));
  }, [updateActive]);

  const handleAddUser = useCallback((name: string) => {
    if (chatMode !== 'group') return false;
    const normalizedName = name.trim();
    if (!normalizedName) return false;
    if (active.users.some(user => user.name === normalizedName)) {
      showToast('群成员名称不能重复');
      return false;
    }
    const nextId = active.users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
    updateActive(workspace => ({
      ...workspace,
      users: [...workspace.users, { id: nextId, name: normalizedName, avatar: null }],
    }));
    showToast(`已添加群成员“${normalizedName}”`);
    return true;
  }, [active.users, chatMode, showToast, updateActive]);

  const handleUpdateUserName = useCallback((userId: number, name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      showToast('角色名称不能为空');
      return false;
    }
    if (active.users.some(user => user.id !== userId && user.name === normalizedName)) {
      showToast('角色名称不能重复');
      return false;
    }
    updateActive(workspace => ({
      ...workspace,
      users: workspace.users.map(user => user.id === userId ? { ...user, name: normalizedName } : user),
    }));
    return true;
  }, [active.users, showToast, updateActive]);

  const handleDeleteUser = useCallback((userId: number) => {
    if (chatMode !== 'group') return;
    if (active.users.length <= 2) {
      showToast('群聊至少需要保留两名成员');
      return;
    }
    const target = active.users.find(user => user.id === userId);
    if (!target || !window.confirm(`删除成员“${target.name}”及其全部发言？`)) return;
    updateActive(workspace => {
      const remainingUsers = workspace.users.filter(user => user.id !== userId);
      return {
        ...workspace,
        users: remainingUsers,
        messages: workspace.messages.filter(message => message.type === 'time' || message.senderId !== userId),
        selfId: workspace.selfId === userId ? remainingUsers[0]?.id ?? null : workspace.selfId,
      };
    });
    showToast(`已删除成员“${target.name}”`);
  }, [active.users, chatMode, showToast, updateActive]);

  const handleUpdateMessage = useCallback((messageId: number, content: string) => {
    updateActive(workspace => ({
      ...workspace,
      messages: workspace.messages.map(message => message.id === messageId ? { ...message, content } : message),
    }));
  }, [updateActive]);

  const handleAddMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    updateActive(workspace => {
      const maxId = workspace.messages.reduce((max, item) => Math.max(max, item.id), 0);
      return { ...workspace, messages: [...workspace.messages, { ...message, id: maxId + 1 }] };
    });
  }, [updateActive]);

  const handleDeleteMessage = useCallback((messageId: number) => {
    updateActive(workspace => ({
      ...workspace,
      messages: workspace.messages.filter(message => message.id !== messageId),
    }));
  }, [updateActive]);

  const handleSettingsChange = useCallback((settings: PhoneSettings) => {
    updateActive(workspace => ({ ...workspace, settings }));
  }, [updateActive]);

  const handleImportTextChange = useCallback((importText: string) => {
    updateActive(workspace => ({ ...workspace, importText }));
  }, [updateActive]);

  const handleSetSelf = useCallback((selfId: number) => {
    updateActive(workspace => ({ ...workspace, selfId }));
  }, [updateActive]);

  const handleReset = useCallback(() => {
    const modeLabel = chatMode === 'private' ? '私聊' : '群聊';
    if (!window.confirm(`恢复默认${modeLabel}示例？当前${modeLabel}内容将被清空。`)) return;
    setWorkspaces(previous => ({
      ...previous,
      [chatMode]: cloneWorkspace(chatMode === 'private' ? PRIVATE_WORKSPACE : GROUP_WORKSPACE),
    }));
    showToast(`已恢复默认${modeLabel}示例`);
  }, [chatMode, showToast]);

  const capturePhone = useCallback(async (longshot = false): Promise<HTMLCanvasElement | null> => {
    const phone = phoneRef.current;
    if (!phone) return null;
    const content = phone.closest('.wc-phone-content') as HTMLElement | null;
    const wrap = phone.closest('.wc-phone-wrap') as HTMLElement | null;
    const scaleWrap = phone.closest('.wc-phone-scale-wrap') as HTMLElement | null;
    if (!content || !wrap) return null;

    const saved = {
      contentTransform: content.style.transform,
      contentOrigin: content.style.transformOrigin,
      wrapWidth: wrap.style.width,
      wrapHeight: wrap.style.height,
      wrapOverflow: wrap.style.overflow,
      wrapRadius: wrap.style.borderRadius,
      wrapShadow: wrap.style.boxShadow,
      scalePosition: scaleWrap?.style.position ?? '',
      scaleTop: scaleWrap?.style.top ?? '',
      scaleLeft: scaleWrap?.style.left ?? '',
      scaleWidth: scaleWrap?.style.width ?? '',
      scaleHeight: scaleWrap?.style.height ?? '',
    };

    const chatBody = phone.querySelector('.wc-chat-body') as HTMLElement | null;
    const chatContent = phone.querySelector('.wc-chat-content') as HTMLElement | null;
    const scrollTop = chatBody?.scrollTop ?? 0;
    const savedContentMargin = chatContent?.style.marginTop ?? '';

    content.style.transform = 'none';
    wrap.style.width = '1179px';
    wrap.style.height = '2556px';
    wrap.style.overflow = 'hidden';
    wrap.style.borderRadius = '0';
    wrap.style.boxShadow = 'none';
    if (scaleWrap) {
      scaleWrap.style.position = 'fixed';
      scaleWrap.style.top = '0';
      scaleWrap.style.left = '-9999px';
      scaleWrap.style.width = '1179px';
      scaleWrap.style.height = '2556px';
    }
    if (!longshot && chatContent && scrollTop > 0) chatContent.style.marginTop = `-${scrollTop}px`;

    let longOriginal: Record<string, string> | null = null;
    if (longshot) {
      const bottom = phone.querySelector('.wc-bottom') as HTMLElement | null;
      if (chatBody && bottom) {
        longOriginal = {
          phoneHeight: phone.style.height,
          phoneOverflow: phone.style.overflow,
          bodyPosition: chatBody.style.position,
          bodyTop: chatBody.style.top,
          bodyBottom: chatBody.style.bottom,
          bodyOverflow: chatBody.style.overflowY,
          bodyHeight: chatBody.style.height,
          bottomPosition: bottom.style.position,
          bottomBottom: bottom.style.bottom,
        };
        phone.style.height = 'auto';
        phone.style.overflow = 'visible';
        wrap.style.height = 'auto';
        chatBody.style.position = 'relative';
        chatBody.style.top = 'auto';
        chatBody.style.bottom = 'auto';
        chatBody.style.overflowY = 'visible';
        chatBody.style.height = 'auto';
        bottom.style.position = 'relative';
        bottom.style.bottom = 'auto';
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50));
    const totalHeight = longshot ? phone.scrollHeight : 2556;
    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = await toCanvas(phone, {
        width: 1179,
        height: totalHeight,
        pixelRatio: 1,
        backgroundColor: active.settings.backgroundColor,
      });
      renderReferenceChrome(canvas, { settings: active.settings, title: exportTitle });
    } finally {
      content.style.transform = saved.contentTransform;
      content.style.transformOrigin = saved.contentOrigin;
      wrap.style.width = saved.wrapWidth;
      wrap.style.height = saved.wrapHeight;
      wrap.style.overflow = saved.wrapOverflow;
      wrap.style.borderRadius = saved.wrapRadius;
      wrap.style.boxShadow = saved.wrapShadow;
      if (scaleWrap) {
        scaleWrap.style.position = saved.scalePosition;
        scaleWrap.style.top = saved.scaleTop;
        scaleWrap.style.left = saved.scaleLeft;
        scaleWrap.style.width = saved.scaleWidth;
        scaleWrap.style.height = saved.scaleHeight;
      }
      if (chatContent) chatContent.style.marginTop = savedContentMargin;
      if (chatBody && scrollTop > 0) requestAnimationFrame(() => { chatBody.scrollTop = scrollTop; });
      if (longshot && longOriginal) {
        const bottom = phone.querySelector('.wc-bottom') as HTMLElement | null;
        if (chatBody && bottom) {
          phone.style.height = longOriginal.phoneHeight;
          phone.style.overflow = longOriginal.phoneOverflow;
          chatBody.style.position = longOriginal.bodyPosition;
          chatBody.style.top = longOriginal.bodyTop;
          chatBody.style.bottom = longOriginal.bodyBottom;
          chatBody.style.overflowY = longOriginal.bodyOverflow;
          chatBody.style.height = longOriginal.bodyHeight;
          bottom.style.position = longOriginal.bottomPosition;
          bottom.style.bottom = longOriginal.bottomBottom;
        }
      }
    }
    return canvas;
  }, [active.settings, exportTitle]);

  const handleGenerateImage = useCallback(async () => {
    showToast('正在生成图片…');
    try {
      const canvas = await capturePhone(false);
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `微信${chatMode === 'private' ? '私聊' : '群聊'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('1179×2556 图片已生成');
    } catch (error: unknown) {
      showToast(`生成失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }, [capturePhone, chatMode, showToast]);

  const handleCopyImage = useCallback(async () => {
    showToast('正在生成图片…');
    try {
      const canvas = await capturePhone(false);
      if (!canvas) return;
      canvas.toBlob(async blob => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('图片已复制到剪贴板');
        } catch {
          showToast('复制失败，请使用下载功能');
        }
      });
    } catch {
      showToast('操作失败');
    }
  }, [capturePhone, showToast]);

  const handleGenerateLongImage = useCallback(async () => {
    showToast('正在生成长截图…');
    try {
      const canvas = await capturePhone(true);
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `微信${chatMode === 'private' ? '私聊' : '群聊'}_长截图_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('长截图已生成');
    } catch (error: unknown) {
      showToast(`生成失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }, [capturePhone, chatMode, showToast]);

  const hasChat = active.users.length > 0;

  return (
    <>
      <header className="app-header">
        <h1><MessageSquare size={22} /> 微信聊天生成器</h1>

        <div className="chat-mode-tabs" role="tablist" aria-label="聊天类型">
          <button
            type="button"
            role="tab"
            aria-selected={chatMode === 'private'}
            className={chatMode === 'private' ? 'active' : ''}
            onClick={() => setChatMode('private')}
          >
            <UserRound size={15} /> 私聊
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={chatMode === 'group'}
            className={chatMode === 'group' ? 'active' : ''}
            onClick={() => setChatMode('group')}
          >
            <UsersRound size={15} /> 群聊
          </button>
        </div>

        {hasChat && (
          <div className="app-header-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleReset}><RotateCcw size={15} /> 恢复示例</button>
            <button className="btn btn-primary btn-sm" onClick={handleGenerateImage}><Download size={15} /> 生成图片</button>
            <button className="btn btn-outline btn-sm" onClick={handleCopyImage}><Copy size={15} /> 复制</button>
            <button className="btn btn-outline btn-sm" onClick={handleGenerateLongImage}><ImageIcon size={15} /> 长截图</button>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className="app-left">
          <UserAvatarManager
            mode={chatMode}
            users={active.users}
            selfId={active.selfId}
            onAddUser={handleAddUser}
            onUpdateName={handleUpdateUserName}
            onUpdateAvatar={handleUpdateAvatar}
            onRemoveAvatar={handleRemoveAvatar}
            onDeleteUser={handleDeleteUser}
            onSetSelf={handleSetSelf}
          />
          <MessageEditor
            mode={chatMode}
            users={active.users}
            messages={active.messages}
            selfId={active.selfId}
            onAddMessage={handleAddMessage}
            onDeleteMessage={handleDeleteMessage}
          />
          <SettingsPanel
            mode={chatMode}
            settings={active.settings}
            onSettingsChange={handleSettingsChange}
          />
          <ImportPanel
            mode={chatMode}
            text={active.importText}
            onTextChange={handleImportTextChange}
            onImport={handleImport}
          />
        </div>
        {hasChat && (
          <PhonePreview
            key={chatMode}
            mode={chatMode}
            users={active.users}
            messages={active.messages}
            settings={active.settings}
            selfId={active.selfId}
            phoneRef={phoneRef}
            onUpdateMessage={handleUpdateMessage}
          />
        )}
      </main>

      {toast && <div className="toast-msg">{toast}</div>}
    </>
  );
}

export default App;
