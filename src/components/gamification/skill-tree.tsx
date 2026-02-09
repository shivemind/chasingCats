'use client';

import { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  level: number; // 0-3 (locked, beginner, intermediate, mastered)
  progress: number; // 0-100 within current level
  xpToUnlock: number;
  prerequisites: string[];
  position: { x: number; y: number };
  contentIds: string[];
}

interface SkillCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'camera', name: 'Camera Mastery', color: 'from-blue-500 to-cyan-500', icon: '📷' },
  { id: 'lighting', name: 'Lighting & Exposure', color: 'from-yellow-500 to-orange-500', icon: '💡' },
  { id: 'composition', name: 'Composition', color: 'from-purple-500 to-pink-500', icon: '🎨' },
  { id: 'wildlife', name: 'Wildlife Behavior', color: 'from-green-500 to-emerald-500', icon: '🦁' },
  { id: 'post', name: 'Post-Processing', color: 'from-red-500 to-rose-500', icon: '✨' },
  { id: 'field', name: 'Field Craft', color: 'from-amber-500 to-yellow-600', icon: '🏕️' },
];

const LEVEL_NAMES = ['Locked', 'Beginner', 'Intermediate', 'Mastered'];

// Individual skill node
function SkillNode({ 
  skill, 
  onSelect, 
  isSelected,
  isConnected: _isConnected 
}: { 
  skill: Skill; 
  onSelect: () => void; 
  isSelected: boolean;
  isConnected: boolean;
}) {
  const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
  const isLocked = skill.level === 0;
  const isMastered = skill.level === 3;

  return (
    <button
      onClick={onSelect}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
        isSelected ? 'scale-110 z-10' : 'hover:scale-105'
      }`}
      style={{ left: `${skill.position.x}%`, top: `${skill.position.y}%` }}
    >
      <div className={`relative flex flex-col items-center`}>
        {/* Node circle */}
        <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all ${
          isLocked 
            ? 'border-gray-600 bg-gray-800/50' 
            : isMastered
            ? `border-cat-eye bg-gradient-to-br ${category?.color} shadow-[0_0_20px_rgba(255,215,0,0.4)]`
            : `border-white/30 bg-gradient-to-br ${category?.color}`
        } ${isSelected ? 'ring-4 ring-neon-cyan ring-offset-2 ring-offset-deep-space' : ''}`}>
          <span className={`text-2xl ${isLocked ? 'opacity-30' : ''}`}>
            {isLocked ? '🔒' : skill.icon}
          </span>

          {/* Progress ring for unlocked skills */}
          {!isLocked && !isMastered && (
            <svg className="absolute inset-0 h-16 w-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#00F5D4"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${skill.progress * 1.76} 176`}
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Mastered star */}
          {isMastered && (
            <span className="absolute -top-1 -right-1 text-lg">⭐</span>
          )}
        </div>

        {/* Skill name */}
        <p className={`mt-2 text-xs font-medium max-w-20 text-center ${
          isLocked ? 'text-gray-500' : 'text-white'
        }`}>
          {skill.name}
        </p>

        {/* Level indicator */}
        <div className="flex gap-0.5 mt-1">
          {[1, 2, 3].map((lvl) => (
            <div 
              key={lvl}
              className={`h-1 w-3 rounded-full ${
                skill.level >= lvl ? 'bg-neon-cyan' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

// Connection lines between skills
function SkillConnections({ skills }: { skills: Skill[] }) {
  return (
    <svg className="absolute inset-0 pointer-events-none">
      {skills.map((skill) =>
        skill.prerequisites.map((prereqId) => {
          const prereq = skills.find(s => s.id === prereqId);
          if (!prereq) return null;

          const isUnlocked = skill.level > 0;
          
          return (
            <line
              key={`${prereqId}-${skill.id}`}
              x1={`${prereq.position.x}%`}
              y1={`${prereq.position.y}%`}
              x2={`${skill.position.x}%`}
              y2={`${skill.position.y}%`}
              stroke={isUnlocked ? '#00F5D4' : '#374151'}
              strokeWidth={isUnlocked ? 3 : 2}
              strokeDasharray={isUnlocked ? '' : '5,5'}
              className={isUnlocked ? 'drop-shadow-[0_0_4px_rgba(0,245,212,0.5)]' : ''}
            />
          );
        })
      )}
    </svg>
  );
}

// Skill detail panel
function SkillDetailPanel({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
  const isLocked = skill.level === 0;

  return (
    <div className="absolute right-4 top-4 w-80 rounded-2xl border border-white/10 bg-deep-space/95 backdrop-blur-md p-6 animate-scale-in z-20">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${category?.color}`}>
          <span className="text-2xl">{skill.icon}</span>
        </div>
        <div>
          <h3 className="font-semibold text-white">{skill.name}</h3>
          <p className={`text-xs bg-gradient-to-r ${category?.color} bg-clip-text text-transparent`}>
            {category?.name}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">{skill.description}</p>

      {/* Current level */}
      <div className="rounded-xl bg-white/5 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Current Level</span>
          <span className={`font-semibold ${
            isLocked ? 'text-gray-500' : skill.level === 3 ? 'text-cat-eye' : 'text-neon-cyan'
          }`}>
            {LEVEL_NAMES[skill.level]}
          </span>
        </div>
        
        {!isLocked && skill.level < 3 && (
          <>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                style={{ width: `${skill.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {skill.progress}% to {LEVEL_NAMES[skill.level + 1]}
            </p>
          </>
        )}

        {isLocked && (
          <p className="text-xs text-gray-500">
            Complete prerequisites to unlock
          </p>
        )}
      </div>

      {/* Prerequisites */}
      {skill.prerequisites.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Prerequisites</p>
          <div className="flex flex-wrap gap-2">
            {skill.prerequisites.map((prereqId) => (
              <span key={prereqId} className="rounded-full bg-white/10 px-2 py-1 text-xs text-gray-400">
                {prereqId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related content */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Related Content</p>
        <div className="space-y-2">
          {skill.contentIds.slice(0, 3).map((contentId) => (
            <a
              key={contentId}
              href={`/content/${contentId}`}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span>📚 {contentId}</span>
              <span>→</span>
            </a>
          ))}
        </div>
      </div>

      {/* Level up button */}
      {!isLocked && skill.level < 3 && (
        <button className="mt-4 w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple py-2 text-sm font-semibold text-white">
          View Learning Path →
        </button>
      )}
    </div>
  );
}

// Main skill tree component
export function SkillTree({ skills }: { skills: Skill[] }) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredSkills = activeCategory 
    ? skills.filter(s => s.category === activeCategory)
    : skills;

  const totalMastered = skills.filter(s => s.level === 3).length;
  const totalUnlocked = skills.filter(s => s.level > 0).length;

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Skill Tree</h2>
            <p className="text-gray-400">Master your wildlife photography skills</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-neon-cyan">{totalUnlocked}</p>
              <p className="text-xs text-gray-400">Skills Unlocked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cat-eye">{totalMastered}</p>
              <p className="text-xs text-gray-400">Mastered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !activeCategory ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          All Skills
        </button>
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.id 
                ? `bg-gradient-to-r ${cat.color} text-white` 
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Skill tree visualization */}
      <div className="relative rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden" style={{ height: '600px' }}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        {/* Connections */}
        <SkillConnections skills={filteredSkills} />

        {/* Skill nodes */}
        {filteredSkills.map((skill) => (
          <SkillNode
            key={skill.id}
            skill={skill}
            isSelected={selectedSkill?.id === skill.id}
            isConnected={selectedSkill?.prerequisites.includes(skill.id) || false}
            onSelect={() => setSelectedSkill(skill)}
          />
        ))}

        {/* Detail panel */}
        {selectedSkill && (
          <SkillDetailPanel 
            skill={selectedSkill} 
            onClose={() => setSelectedSkill(null)} 
          />
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 backdrop-blur-md p-4">
          <p className="text-xs text-gray-400 mb-2">Legend</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-400">Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
              <span className="text-xs text-gray-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-cat-eye shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              <span className="text-xs text-gray-400">Mastered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
