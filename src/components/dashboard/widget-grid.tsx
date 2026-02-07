'use client';

import { useState, useCallback } from 'react';
import { ReactNode } from 'react';

export type WidgetSize = 'small' | 'medium' | 'large';
export type WidgetType = 
  | 'continue-watching' 
  | 'streak' 
  | 'recommendations' 
  | 'upcoming-events' 
  | 'achievements' 
  | 'stats' 
  | 'notes' 
  | 'quick-links';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  order: number;
  isVisible: boolean;
}

interface WidgetConfig {
  type: WidgetType;
  title: string;
  icon: string;
  defaultSize: WidgetSize;
  description: string;
}

export const widgetConfigs: WidgetConfig[] = [
  { type: 'continue-watching', title: 'Continue Watching', icon: '▶️', defaultSize: 'large', description: 'Resume where you left off' },
  { type: 'streak', title: 'Learning Streak', icon: '🔥', defaultSize: 'small', description: 'Track your daily progress' },
  { type: 'recommendations', title: 'Recommended for You', icon: '✨', defaultSize: 'medium', description: 'Personalized content suggestions' },
  { type: 'upcoming-events', title: 'Upcoming Events', icon: '📅', defaultSize: 'medium', description: 'Live sessions & workshops' },
  { type: 'achievements', title: 'Recent Achievements', icon: '🏆', defaultSize: 'small', description: 'Badges & milestones' },
  { type: 'stats', title: 'Your Stats', icon: '📊', defaultSize: 'small', description: 'Learning statistics' },
  { type: 'notes', title: 'Recent Notes', icon: '📝', defaultSize: 'medium', description: 'Your video notes' },
  { type: 'quick-links', title: 'Quick Links', icon: '🔗', defaultSize: 'small', description: 'Favorite shortcuts' },
];

// Widget wrapper component
interface WidgetWrapperProps {
  widget: Widget;
  children: ReactNode;
  isEditing: boolean;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
}

export function WidgetWrapper({ widget, children, isEditing, onRemove, onResize }: WidgetWrapperProps) {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3',
  };

  return (
    <div 
      className={`relative rounded-2xl border border-white/10 bg-deep-space/50 p-6 ${sizeClasses[widget.size]} ${
        isEditing ? 'ring-2 ring-neon-cyan/50 ring-dashed' : ''
      }`}
    >
      {/* Edit controls */}
      {isEditing && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          {/* Size controls */}
          <div className="flex rounded-lg bg-white/5 p-1">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => onResize(size)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  widget.size === size 
                    ? 'bg-neon-cyan text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={size}
              >
                {size[0].toUpperCase()}
              </button>
            ))}
          </div>
          
          {/* Remove button */}
          <button
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            title="Remove widget"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Widget header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{widgetConfigs.find(c => c.type === widget.type)?.icon}</span>
        <h3 className="font-semibold text-white">{widget.title}</h3>
      </div>

      {/* Widget content */}
      {children}
    </div>
  );
}

// Add widget modal
interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
  activeWidgets: WidgetType[];
}

export function AddWidgetModal({ isOpen, onClose, onAdd, activeWidgets }: AddWidgetModalProps) {
  if (!isOpen) return null;

  const availableWidgets = widgetConfigs.filter(w => !activeWidgets.includes(w.type));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-deep-space p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add Widget</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {availableWidgets.length === 0 ? (
          <p className="text-center text-gray-400 py-8">All widgets are already added!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                onClick={() => {
                  onAdd(widget.type);
                  onClose();
                }}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-neon-cyan/30 hover:bg-neon-cyan/10"
              >
                <span className="text-2xl">{widget.icon}</span>
                <div>
                  <h4 className="font-medium text-white">{widget.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{widget.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Dashboard customization controls
interface DashboardControlsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onAddWidget: () => void;
  onReset: () => void;
}

export function DashboardControls({ isEditing, onToggleEdit, onAddWidget, onReset }: DashboardControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {isEditing && (
        <>
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 rounded-full bg-neon-cyan/20 px-4 py-2 text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Widget
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            Reset Layout
          </button>
        </>
      )}
      <button
        onClick={onToggleEdit}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
          isEditing
            ? 'bg-green-500 text-white'
            : 'border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        {isEditing ? (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Done
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Customize
          </>
        )}
      </button>
    </div>
  );
}

// Hook to manage dashboard state
export function useDashboardWidgets() {
  const defaultWidgets: Widget[] = [
    { id: '1', type: 'continue-watching', title: 'Continue Watching', size: 'large', order: 0, isVisible: true },
    { id: '2', type: 'streak', title: 'Learning Streak', size: 'small', order: 1, isVisible: true },
    { id: '3', type: 'achievements', title: 'Recent Achievements', size: 'small', order: 2, isVisible: true },
    { id: '4', type: 'recommendations', title: 'Recommended for You', size: 'medium', order: 3, isVisible: true },
    { id: '5', type: 'upcoming-events', title: 'Upcoming Events', size: 'medium', order: 4, isVisible: true },
  ];

  const [widgets, setWidgets] = useState<Widget[]>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard_widgets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultWidgets;
        }
      }
    }
    return defaultWidgets;
  });

  const [isEditing, setIsEditing] = useState(false);

  const saveWidgets = useCallback((newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_widgets', JSON.stringify(newWidgets));
    }
  }, []);

  const addWidget = useCallback((type: WidgetType) => {
    const config = widgetConfigs.find(c => c.type === type);
    if (!config) return;

    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: config.title,
      size: config.defaultSize,
      order: widgets.length,
      isVisible: true,
    };

    saveWidgets([...widgets, newWidget]);
  }, [widgets, saveWidgets]);

  const removeWidget = useCallback((id: string) => {
    saveWidgets(widgets.filter(w => w.id !== id));
  }, [widgets, saveWidgets]);

  const resizeWidget = useCallback((id: string, size: WidgetSize) => {
    saveWidgets(widgets.map(w => w.id === id ? { ...w, size } : w));
  }, [widgets, saveWidgets]);

  const resetWidgets = useCallback(() => {
    saveWidgets(defaultWidgets);
  }, [saveWidgets]);

  return {
    widgets: widgets.filter(w => w.isVisible).sort((a, b) => a.order - b.order),
    isEditing,
    setIsEditing,
    addWidget,
    removeWidget,
    resizeWidget,
    resetWidgets,
  };
}
