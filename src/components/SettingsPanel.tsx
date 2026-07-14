import { useRef } from 'react';
import { ImagePlus, Settings, Smartphone, Volume2, VolumeX, Wifi, WifiOff, X } from 'lucide-react';
import type { ChatMode, PhoneSettings } from '@/types';

interface SettingsPanelProps {
  mode: ChatMode;
  settings: PhoneSettings;
  onSettingsChange: (settings: PhoneSettings) => void;
}

export function SettingsPanel({ mode, settings, onSettingsChange }: SettingsPanelProps) {
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const update = (patch: Partial<PhoneSettings>) => onSettingsChange({ ...settings, ...patch });

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = loadEvent => update({ backgroundImage: loadEvent.target?.result as string });
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <section className="s-card">
      <div className="s-card-header">
        <div>
          <h2><Settings size={20} /> 微信外观</h2>
          <p className="section-kicker">按 iPhone 微信截图调整状态栏与聊天背景</p>
        </div>
      </div>
      <div className="s-card-body">
        <div className="form-grid">
          <div className="form-item">
            <label className="form-label">手机时间</label>
            <input type="time" className="form-input" value={settings.time} onChange={event => update({ time: event.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">{mode === 'group' ? '群聊名称' : '联系人名称'}</label>
            <input type="text" className="form-input" value={settings.contactName} onChange={event => update({ contactName: event.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">{settings.isDualSim ? '双卡信号格数' : '单卡信号格数'}</label>
            <select className="form-input" value={settings.signal} onChange={event => update({ signal: parseInt(event.target.value, 10) })}>
              <option value={1}>1格</option>
              <option value={2}>2格</option>
              <option value={3}>3格</option>
              <option value={4}>4格</option>
            </select>
          </div>
          <div className="form-item">
            <label className="form-label">SIM 模式</label>
            <button
              type="button"
              className={`setting-switch ${settings.isDualSim ? 'active' : ''}`}
              aria-pressed={settings.isDualSim}
              onClick={() => update({ isDualSim: !settings.isDualSim })}
            >
              <Smartphone size={16} />
              {settings.isDualSim ? '双卡' : '单卡'}
            </button>
          </div>
          <div className="form-item">
            <label className="form-label">无线网络</label>
            <button
              type="button"
              className={`setting-switch ${settings.isWifiEnabled ? 'active' : ''}`}
              aria-pressed={settings.isWifiEnabled}
              onClick={() => update({ isWifiEnabled: !settings.isWifiEnabled })}
            >
              {settings.isWifiEnabled ? <Wifi size={16} /> : <WifiOff size={16} />}
              {settings.isWifiEnabled ? 'Wi-Fi 已开启' : 'Wi-Fi 已关闭'}
            </button>
          </div>
          <div className="form-item">
            <label className="form-label">未读消息</label>
            <input type="number" className="form-input" min={0} max={999} value={settings.unreadCount} onChange={event => update({ unreadCount: parseInt(event.target.value, 10) || 0 })} />
          </div>
          <div className="form-item">
            <label className="form-label">电量 {settings.battery}%</label>
            <input type="range" className="form-range" min={0} max={100} value={settings.battery} onChange={event => update({ battery: parseInt(event.target.value, 10) })} />
          </div>
          <div className="form-item">
            <label className="form-label">静音状态</label>
            <button
              type="button"
              className={`setting-switch ${settings.isMuted ? 'active' : ''}`}
              aria-pressed={settings.isMuted}
              onClick={() => update({ isMuted: !settings.isMuted })}
            >
              {settings.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {settings.isMuted ? '已静音' : '有声音'}
            </button>
          </div>
          <div className="form-item">
            <label className="form-label">自己气泡色</label>
            <div className="color-control">
              <input type="color" className="form-color" value={settings.selfBubbleColor} onChange={event => update({ selfBubbleColor: event.target.value })} />
              <span>{settings.selfBubbleColor}</span>
            </div>
          </div>
          <div className="form-item">
            <label className="form-label">对方气泡色</label>
            <div className="color-control">
              <input type="color" className="form-color" value={settings.otherBubbleColor} onChange={event => update({ otherBubbleColor: event.target.value })} />
              <span>{settings.otherBubbleColor}</span>
            </div>
          </div>
          <div className="form-item form-item-full">
            <label className="form-label">聊天背景</label>
            <div className="background-settings">
              <div className="color-control background-color-control">
                <input type="color" className="form-color" value={settings.backgroundColor} onChange={event => update({ backgroundColor: event.target.value })} />
                <span>{settings.backgroundColor}</span>
              </div>
              <input ref={backgroundInputRef} type="file" accept="image/*" hidden onChange={handleBackgroundUpload} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => backgroundInputRef.current?.click()}>
                <ImagePlus size={15} /> {settings.backgroundImage ? '更换壁纸' : '上传壁纸'}
              </button>
              {settings.backgroundImage && (
                <>
                  <span className="background-thumb" style={{ backgroundImage: `url(${settings.backgroundImage})` }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => update({ backgroundImage: null })}>
                    <X size={15} /> 移除
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
