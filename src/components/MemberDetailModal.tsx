'use client';

import { useState, useRef, useEffect } from 'react';
import { Member, Story } from '@/types/family';

interface MemberDetailModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onUpdate: (member: Member) => void;
  initialTab?: 'album' | 'stories';
}

export default function MemberDetailModal({ isOpen, member, onClose, onUpdate, initialTab = 'album' }: MemberDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'album' | 'stories'>(initialTab);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const albumInputRef = useRef<HTMLInputElement>(null);

  // 当 initialTab 变化时更新 activeTab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen || !member) return null;

  const album = member.album || [];
  const stories = [...(member.stories || [])].sort((a, b) => {
    if (a.year && b.year) return a.year - b.year;
    if (a.year) return -1;
    if (b.year) return 1;
    return 0;
  });

  // 上传相册照片
  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotos: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('memberId', String(member.id));
        fd.append('memberName', member.name);
        fd.append('type', 'album');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: fd
        });

        if (response.ok) {
          const data = await response.json();
          newPhotos.push(data.path);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    if (newPhotos.length > 0) {
      onUpdate({
        ...member,
        album: [...album, ...newPhotos]
      });
    }

    setIsUploading(false);
    if (albumInputRef.current) albumInputRef.current.value = '';
  };

  // 删除相册照片
  const handleDeletePhoto = (photoPath: string) => {
    if (!confirm('确定要删除这张照片吗？')) return;
    onUpdate({
      ...member,
      album: album.filter(p => p !== photoPath)
    });
  };

  // 添加故事
  const handleAddStory = (story: Omit<Story, 'id'>) => {
    const newStory: Story = {
      ...story,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    onUpdate({
      ...member,
      stories: [...(member.stories || []), newStory]
    });
    setIsAddingStory(false);
  };

  // 更新故事
  const handleUpdateStory = (story: Story) => {
    onUpdate({
      ...member,
      stories: (member.stories || []).map(s => s.id === story.id ? story : s)
    });
    setEditingStory(null);
  };

  // 删除故事
  const handleDeleteStory = (storyId: number) => {
    if (!confirm('确定要删除这个故事吗？')) return;
    onUpdate({
      ...member,
      stories: (member.stories || []).filter(s => s.id !== storyId)
    });
  };

  return (
    <div className="modal show member-detail-modal">
      <div className="modal-content large">
        <span className="modal-close" onClick={onClose}>&times;</span>
        <h2>{member.name} 的故事</h2>

        <div className="detail-tabs">
          <button 
            className={`tab-btn ${activeTab === 'album' ? 'active' : ''}`}
            onClick={() => setActiveTab('album')}
          >
            📷 相册 ({album.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => setActiveTab('stories')}
          >
            📖 故事 ({stories.length})
          </button>
        </div>

        <div className="detail-content">
          {activeTab === 'album' && (
            <div className="album-section">
              <div className="album-grid">
                {album.map((photo, index) => (
                  <div key={index} className="album-item">
                    <img src={photo} alt={`照片 ${index + 1}`} />
                    <button className="delete-btn" onClick={() => handleDeletePhoto(photo)}>×</button>
                  </div>
                ))}
                <div 
                  className="album-add"
                  onClick={() => albumInputRef.current?.click()}
                >
                  {isUploading ? '上传中...' : '+ 添加照片'}
                </div>
              </div>
              <input
                ref={albumInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleAlbumUpload}
              />
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="stories-section">
              {stories.map(story => (
                <StoryCard
                  key={story.id}
                  story={story}
                  isEditing={editingStory?.id === story.id}
                  onEdit={() => setEditingStory(story)}
                  onSave={(s) => handleUpdateStory(s as Story)}
                  onCancel={() => setEditingStory(null)}
                  onDelete={() => handleDeleteStory(story.id)}
                />
              ))}
              
              {isAddingStory ? (
                <StoryEditor
                  onSave={handleAddStory}
                  onCancel={() => setIsAddingStory(false)}
                />
              ) : (
                <button className="add-story-btn" onClick={() => setIsAddingStory(true)}>
                  + 添加新故事
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// 故事卡片组件
function StoryCard({ 
  story, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete 
}: {
  story: Story;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (story: Story | Omit<Story, 'id'>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (isEditing) {
    return <StoryEditor story={story} onSave={onSave} onCancel={onCancel} />;
  }

  return (
    <div className="story-card">
      <div className="story-header">
        <h3>{story.title}</h3>
        {story.year && <span className="story-year">{story.year}年</span>}
      </div>
      <div className="story-content">{story.content}</div>
      {story.photos && story.photos.length > 0 && (
        <div className="story-photos">
          {story.photos.map((photo, i) => (
            <img key={i} src={photo} alt="" />
          ))}
        </div>
      )}
      <div className="story-actions">
        <button onClick={onEdit}>编辑</button>
        <button onClick={onDelete} className="delete">删除</button>
      </div>
    </div>
  );
}

// 故事编辑器组件
function StoryEditor({ 
  story, 
  onSave, 
  onCancel 
}: {
  story?: Story;
  onSave: (story: Story | Omit<Story, 'id'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(story?.title || '');
  const [year, setYear] = useState(story?.year?.toString() || '');
  const [content, setContent] = useState(story?.content || '');

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('请输入故事标题');
      return;
    }
    if (!content.trim()) {
      alert('请输入故事内容');
      return;
    }

    const storyData = {
      ...(story ? { id: story.id } : {}),
      title: title.trim(),
      year: year ? parseInt(year) : null,
      content: content.trim(),
      photos: story?.photos || []
    };

    onSave(storyData as Story);
  };

  return (
    <div className="story-editor">
      <div className="editor-row">
        <input
          type="text"
          placeholder="故事标题"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="story-title-input"
        />
        <input
          type="number"
          placeholder="年份（可选）"
          value={year}
          onChange={e => setYear(e.target.value)}
          className="story-year-input"
        />
      </div>
      <textarea
        placeholder="写下这个故事..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={6}
        className="story-content-input"
      />
      <div className="editor-actions">
        <button onClick={onCancel}>取消</button>
        <button onClick={handleSubmit} className="save">保存</button>
      </div>
    </div>
  );
}
