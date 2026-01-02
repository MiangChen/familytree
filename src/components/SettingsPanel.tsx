'use client';

import { useState, useRef } from 'react';
import { Settings, FamilyData } from '@/types/family';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  onExport: () => void;
  onImport: (data: FamilyData) => void;
}

export default function SettingsPanel({ 
  settings, 
  onUpdateSettings, 
  onExport, 
  onImport 
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.settings && data.generations) {
            onImport(data);
            alert('数据导入成功！');
          } else {
            alert('无效的数据格式');
          }
        } catch (err) {
          alert('导入失败：' + (err as Error).message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="settings-panel">
      <button 
        className="settings-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        ⚙️ 设置
      </button>
      
      {isOpen && (
        <div className="settings-content show">
          <h3>页面设置</h3>
          
          <div className="setting-item">
            <label>家族姓氏</label>
            <input 
              type="text" 
              value={settings.familyName}
              onChange={e => onUpdateSettings({ familyName: e.target.value })}
              placeholder="如：陈氏家族"
            />
          </div>
          
          <div className="setting-item">
            <label>籍贯地区</label>
            <input 
              type="text" 
              value={settings.hometown}
              onChange={e => onUpdateSettings({ hometown: e.target.value })}
              placeholder="如：福建闽清"
            />
          </div>
          
          <div className="setting-item">
            <label>配色主题</label>
            <select 
              value={settings.theme}
              onChange={e => onUpdateSettings({ 
                theme: e.target.value as Settings['theme'] 
              })}
            >
              <option value="classic">古典中式</option>
              <option value="modern">现代简约</option>
              <option value="warm">温馨暖色</option>
              <option value="elegant">典雅深色</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>背景图片URL（用逗号分隔多张）</label>
            <textarea 
              rows={3}
              value={settings.bgImages.join(', ')}
              onChange={e => {
                const images = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                onUpdateSettings({ bgImages: images });
              }}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>
          
          <div className="setting-buttons">
            <button onClick={onExport}>📤 导出数据</button>
            <button onClick={handleImportClick}>📥 导入数据</button>
            <input 
              ref={fileInputRef}
              type="file" 
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
