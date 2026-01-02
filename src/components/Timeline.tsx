'use client';

import { Generation } from '@/types/family';

interface TimelineProps {
  generations: Generation[];
  onEditName: (genId: number) => void;
}

export default function Timeline({ generations, onEditName }: TimelineProps) {
  return (
    <div className="timeline">
      <div className="timeline-line" />
      <div id="timelineMarkers">
        {generations.map((gen) => (
          <div key={gen.id} className="timeline-marker" data-gen-id={gen.id}>
            <div className="timeline-dot" />
            <div 
              className="timeline-label"
              onClick={() => onEditName(gen.id)}
              title="点击修改名称"
            >
              {gen.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
