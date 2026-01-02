'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FamilyData, Member, Generation, Settings } from '@/types/family';
import { defaultData } from '@/lib/defaultData';
import { getSpouseIds } from '@/lib/utils';

interface FamilyContextType {
  familyData: FamilyData;
  updateSettings: (settings: Partial<Settings>) => void;
  addGeneration: (name: string, atTop?: boolean) => void;
  updateGenerationName: (genId: number, name: string) => void;
  addMember: (genId: number, member: Omit<Member, 'id'>) => void;
  updateMember: (genId: number, memberId: number, member: Partial<Member>) => void;
  deleteMember: (genId: number, memberId: number) => void;
  exportData: () => void;
  importData: (data: FamilyData) => void;
  toggleConnections: () => void;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [familyData, setFamilyData] = useState<FamilyData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 或 JSON 文件加载数据
  useEffect(() => {
    const loadData = async () => {
      const saved = localStorage.getItem('familyTreeData');
      if (saved) {
        try {
          setFamilyData(JSON.parse(saved));
          setIsLoaded(true);
          return;
        } catch (e) {
          console.error('Failed to parse saved data:', e);
        }
      }
      
      // 如果 localStorage 没有数据，从 JSON 文件加载
      try {
        const response = await fetch('/familyData.json');
        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData.settings && jsonData.generations) {
            setFamilyData(jsonData);
          }
        }
      } catch (e) {
        console.error('Failed to load family data from JSON:', e);
      }
      
      setIsLoaded(true);
    };
    
    loadData();
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('familyTreeData', JSON.stringify(familyData));
    }
  }, [familyData, isLoaded]);

  const updateSettings = (settings: Partial<Settings>) => {
    setFamilyData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  const addGeneration = (name: string, atTop = false) => {
    const newGen: Generation = {
      id: Date.now(),
      name,
      members: []
    };
    setFamilyData(prev => ({
      ...prev,
      generations: atTop 
        ? [newGen, ...prev.generations]
        : [...prev.generations, newGen]
    }));
  };

  const updateGenerationName = (genId: number, name: string) => {
    setFamilyData(prev => ({
      ...prev,
      generations: prev.generations.map(gen =>
        gen.id === genId ? { ...gen, name } : gen
      )
    }));
  };

  const addMember = (genId: number, member: Omit<Member, 'id'>) => {
    const newId = Date.now();
    const newMember: Member = { ...member, id: newId };
    
    setFamilyData(prev => {
      const newGenerations = prev.generations.map(gen => {
        if (gen.id !== genId) return gen;
        
        const updatedMembers = [...gen.members, newMember];
        
        // 设置配偶的反向关系
        if (newMember.spouseIds && newMember.spouseIds.length > 0) {
          newMember.spouseIds.forEach(spouseId => {
            const spouse = updatedMembers.find(m => m.id === spouseId);
            if (spouse) {
              const spouseSpouseIds = getSpouseIds(spouse);
              if (!spouseSpouseIds.includes(newId)) {
                spouse.spouseIds = [...spouseSpouseIds, newId];
                delete spouse.spouseId;
              }
            }
          });
        }
        
        return { ...gen, members: updatedMembers };
      });
      
      return { ...prev, generations: newGenerations };
    });
  };

  const updateMember = (genId: number, memberId: number, updates: Partial<Member>) => {
    setFamilyData(prev => {
      const newGenerations = prev.generations.map(gen => {
        if (gen.id !== genId) return gen;
        
        const updatedMembers = gen.members.map(m => {
          if (m.id !== memberId) return m;
          
          const oldSpouseIds = getSpouseIds(m);
          const newSpouseIds = updates.spouseIds || oldSpouseIds;
          
          // 更新配偶关系
          // 移除不再是配偶的关系
          oldSpouseIds.forEach(oldId => {
            if (!newSpouseIds.includes(oldId)) {
              const oldSpouse = gen.members.find(s => s.id === oldId);
              if (oldSpouse) {
                const spouseIds = getSpouseIds(oldSpouse);
                oldSpouse.spouseIds = spouseIds.filter(id => id !== memberId);
              }
            }
          });
          
          // 添加新的配偶关系
          newSpouseIds.forEach(newId => {
            const newSpouse = gen.members.find(s => s.id === newId);
            if (newSpouse) {
              const spouseIds = getSpouseIds(newSpouse);
              if (!spouseIds.includes(memberId)) {
                newSpouse.spouseIds = [...spouseIds, memberId];
              }
            }
          });
          
          return { ...m, ...updates };
        });
        
        return { ...gen, members: updatedMembers };
      });
      
      return { ...prev, generations: newGenerations };
    });
  };

  const deleteMember = (genId: number, memberId: number) => {
    setFamilyData(prev => ({
      ...prev,
      generations: prev.generations.map(gen =>
        gen.id === genId
          ? { ...gen, members: gen.members.filter(m => m.id !== memberId) }
          : gen
      )
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(familyData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${familyData.settings.familyName}_家族数据_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const importData = (data: FamilyData) => {
    if (data.settings && data.generations) {
      setFamilyData(data);
    }
  };

  const toggleConnections = () => {
    setFamilyData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        showConnections: !prev.settings.showConnections
      }
    }));
  };

  if (!isLoaded) {
    return null; // 或者返回加载状态
  }

  return (
    <FamilyContext.Provider value={{
      familyData,
      updateSettings,
      addGeneration,
      updateGenerationName,
      addMember,
      updateMember,
      deleteMember,
      exportData,
      importData,
      toggleConnections
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyData() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamilyData must be used within a FamilyProvider');
  }
  return context;
}
