'use client';

import { useEffect, useRef, useCallback } from 'react';
import { FamilyData } from '@/types/family';
import { getSpouseIds } from '@/lib/utils';

interface ConnectionLinesProps {
  familyData: FamilyData;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ConnectionLines({ familyData, containerRef }: ConnectionLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const drawConnections = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;
    
    svg.innerHTML = '';
    
    if (!familyData.settings.showConnections) return;
    
    // 获取缩放比例
    const zoomLevel = familyData.settings.zoomLevel || 1;
    
    // 获取 SVG 的位置作为参考点
    const svgRect = svg.getBoundingClientRect();
    const maxWidth = container.scrollWidth;
    const maxHeight = container.scrollHeight;
    
    svg.setAttribute('width', String(maxWidth));
    svg.setAttribute('height', String(maxHeight));
    svg.setAttribute('viewBox', `0 0 ${maxWidth} ${maxHeight}`);
    
    // 遍历所有成员，找到有父母关系的
    familyData.generations.forEach((gen, genIndex) => {
      gen.members.forEach(member => {
        if (member.parentId && genIndex > 0) {
          const parentGen = familyData.generations[genIndex - 1];
          if (parentGen) {
            const parent = parentGen.members.find(m => m.id === member.parentId);
            if (parent) {
              // 检查父亲是否有配偶（在夫妻容器中）
              const parentSpouseIds = getSpouseIds(parent);
              const hasSpouse = parentSpouseIds.length > 0;
              
              drawConnectionLine(svg, parent.id, member.id, svgRect, hasSpouse, zoomLevel);
            }
          }
        }
      });
    });
  }, [familyData, containerRef]);

  useEffect(() => {
    drawConnections();
    
    const handleResize = () => {
      requestAnimationFrame(drawConnections);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawConnections]);

  // 暴露重绘方法
  useEffect(() => {
    (window as unknown as { redrawConnections?: () => void }).redrawConnections = drawConnections;
    return () => {
      delete (window as unknown as { redrawConnections?: () => void }).redrawConnections;
    };
  }, [drawConnections]);

  return (
    <svg 
      ref={svgRef}
      className="connection-lines" 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible'
      }}
    />
  );
}

// 简化的坐标计算：元素位置相对于 SVG，并考虑缩放
function getRelativePosition(element: HTMLElement, svgRect: DOMRect, zoomLevel: number) {
  const rect = element.getBoundingClientRect();
  // getBoundingClientRect 返回的是缩放后的尺寸，需要除以 zoomLevel 转换回原始坐标
  return {
    left: (rect.left - svgRect.left) / zoomLevel,
    top: (rect.top - svgRect.top) / zoomLevel,
    right: (rect.right - svgRect.left) / zoomLevel,
    bottom: (rect.bottom - svgRect.top) / zoomLevel,
    width: rect.width / zoomLevel,
    height: rect.height / zoomLevel,
    centerX: (rect.left - svgRect.left + rect.width / 2) / zoomLevel,
    centerY: (rect.top - svgRect.top + rect.height / 2) / zoomLevel
  };
}

function drawConnectionLine(
  svg: SVGSVGElement, 
  parentId: number, 
  childId: number, 
  svgRect: DOMRect,
  parentHasSpouse: boolean,
  zoomLevel: number
) {
  const childCard = document.querySelector(`.member-card[data-member-id="${childId}"]`) as HTMLElement;
  if (!childCard) return;
  
  let x1: number, y1: number;
  
  if (parentHasSpouse) {
    // 如果父亲有配偶，从夫妻容器的中心底部连线
    const coupleContainer = document.querySelector(`.couple-container[data-main-member-id="${parentId}"]`) as HTMLElement;
    if (coupleContainer) {
      const pos = getRelativePosition(coupleContainer, svgRect, zoomLevel);
      x1 = pos.centerX;
      y1 = pos.bottom;
    } else {
      // 回退到父亲卡片
      const parentCard = document.querySelector(`.member-card[data-member-id="${parentId}"]`) as HTMLElement;
      if (!parentCard) return;
      const pos = getRelativePosition(parentCard, svgRect, zoomLevel);
      x1 = pos.centerX;
      y1 = pos.bottom;
    }
  } else {
    // 没有配偶，从父亲卡片连线
    const parentCard = document.querySelector(`.member-card[data-member-id="${parentId}"]`) as HTMLElement;
    if (!parentCard) return;
    const pos = getRelativePosition(parentCard, svgRect, zoomLevel);
    x1 = pos.centerX;
    y1 = pos.bottom;
  }
  
  // 获取子代卡片位置 - 连接到子代成员卡片的顶部中心
  const childPos = getRelativePosition(childCard, svgRect, zoomLevel);
  const x2 = childPos.centerX;
  const y2 = childPos.top;
  
  const midY = (y1 + y2) / 2;
  
  // 创建路径
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  path.setAttribute('d', d);
  path.setAttribute('class', 'connection-line');
  path.dataset.parent = String(parentId);
  path.dataset.child = String(childId);
  
  svg.appendChild(path);
  
  // 添加连接点
  const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot1.setAttribute('cx', String(x1));
  dot1.setAttribute('cy', String(y1));
  dot1.setAttribute('r', '4');
  dot1.setAttribute('class', 'connection-dot');
  svg.appendChild(dot1);
  
  const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot2.setAttribute('cx', String(x2));
  dot2.setAttribute('cy', String(y2));
  dot2.setAttribute('r', '4');
  dot2.setAttribute('class', 'connection-dot');
  svg.appendChild(dot2);
}
