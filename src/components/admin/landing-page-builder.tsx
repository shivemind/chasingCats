'use client';

import { useState } from 'react';

interface LandingPageSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'faq' | 'stats' | 'gallery';
  enabled: boolean;
  content: Record<string, unknown>;
}

interface LandingPageBuilderProps {
  sections: LandingPageSection[];
  onSave: (sections: LandingPageSection[]) => Promise<void>;
  onPreview: () => void;
}

export function LandingPageBuilder({ sections: initialSections, onSave, onPreview }: LandingPageBuilderProps) {
  const [sections, setSections] = useState(initialSections);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateSection = (id: string, updates: Partial<LandingPageSection>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const updateSectionContent = (id: string, content: Record<string, unknown>) => {
    setSections(sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...content } } : s));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(sections);
    setIsSaving(false);
  };

  const getSectionIcon = (type: LandingPageSection['type']) => {
    switch (type) {
      case 'hero': return '🦸';
      case 'features': return '✨';
      case 'testimonials': return '💬';
      case 'pricing': return '💰';
      case 'cta': return '🎯';
      case 'faq': return '❓';
      case 'stats': return '📊';
      case 'gallery': return '🖼️';
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Sections List */}
      <div className="w-80 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Sections</h2>
        </div>

        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                activeSection === section.id
                  ? 'border-neon-cyan bg-neon-cyan/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getSectionIcon(section.type)}</span>
                  <div>
                    <p className="font-medium text-white capitalize">{section.type}</p>
                    <p className="text-xs text-gray-500">
                      {section.enabled ? 'Visible' : 'Hidden'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                    disabled={index === sections.length - 1}
                    className="text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {activeSection ? (
          <SectionEditor
            section={sections.find(s => s.id === activeSection)!}
            onUpdate={(updates) => updateSection(activeSection, updates)}
            onUpdateContent={(content) => updateSectionContent(activeSection, content)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a section to edit
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="fixed bottom-6 right-6 flex gap-3">
        <button
          onClick={onPreview}
          className="rounded-lg border border-white/10 bg-deep-space px-4 py-2 text-white hover:bg-white/10"
        >
          👁️ Preview
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-2 font-medium text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>
    </div>
  );
}

interface SectionEditorProps {
  section: LandingPageSection;
  onUpdate: (updates: Partial<LandingPageSection>) => void;
  onUpdateContent: (content: Record<string, unknown>) => void;
}

function SectionEditor({ section, onUpdate, onUpdateContent }: SectionEditorProps) {
  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return <HeroEditor content={section.content} onUpdate={onUpdateContent} />;
      case 'features':
        return <FeaturesEditor content={section.content} onUpdate={onUpdateContent} />;
      case 'testimonials':
        return <TestimonialsEditor content={section.content} onUpdate={onUpdateContent} />;
      case 'pricing':
        return <PricingEditor content={section.content} onUpdate={onUpdateContent} />;
      case 'cta':
        return <CTAEditor content={section.content} onUpdate={onUpdateContent} />;
      case 'faq':
        return <FAQEditor content={section.content} onUpdate={onUpdateContent} />;
      case 'stats':
        return <StatsEditor content={section.content} onUpdate={onUpdateContent} />;
      default:
        return <div className="p-6 text-gray-500">Editor not available for this section type</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h3 className="text-lg font-bold text-white capitalize">{section.type} Section</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-400">Visible</span>
          <div
            onClick={() => onUpdate({ enabled: !section.enabled })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              section.enabled ? 'bg-neon-cyan' : 'bg-white/20'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              section.enabled ? 'translate-x-6' : ''
            }`} />
          </div>
        </label>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderEditor()}
      </div>
    </div>
  );
}

function HeroEditor({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Headline</label>
        <input
          type="text"
          value={(content.headline as string) || ''}
          onChange={(e) => onUpdate({ headline: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          placeholder="Master Wildlife Photography"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-2">Subheadline</label>
        <textarea
          value={(content.subheadline as string) || ''}
          onChange={(e) => onUpdate({ subheadline: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
          placeholder="Learn from the best photographers in the world"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Primary CTA Text</label>
          <input
            type="text"
            value={(content.ctaText as string) || ''}
            onChange={(e) => onUpdate({ ctaText: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            placeholder="Start Free Trial"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">CTA Link</label>
          <input
            type="text"
            value={(content.ctaLink as string) || ''}
            onChange={(e) => onUpdate({ ctaLink: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            placeholder="/signup"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-2">Background Image URL</label>
        <input
          type="text"
          value={(content.backgroundImage as string) || ''}
          onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}

function FeaturesEditor({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (c: Record<string, unknown>) => void }) {
  const features = (content.features as Array<{title: string; description: string; icon: string}>) || [];
  
  const updateFeature = (index: number, updates: Partial<typeof features[0]>) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    onUpdate({ features: newFeatures });
  };

  const addFeature = () => {
    onUpdate({ features: [...features, { title: '', description: '', icon: '✨' }] });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Section Title</label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        />
      </div>
      
      <div className="space-y-3">
        {features.map((feature, i) => (
          <div key={i} className="rounded-lg border border-white/10 p-4">
            <div className="grid grid-cols-[auto_1fr] gap-4">
              <input
                type="text"
                value={feature.icon}
                onChange={(e) => updateFeature(i, { icon: e.target.value })}
                className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center text-2xl"
              />
              <input
                type="text"
                value={feature.title}
                onChange={(e) => updateFeature(i, { title: e.target.value })}
                placeholder="Feature title"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              />
            </div>
            <textarea
              value={feature.description}
              onChange={(e) => updateFeature(i, { description: e.target.value })}
              placeholder="Feature description"
              rows={2}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
            />
          </div>
        ))}
      </div>
      
      <button onClick={addFeature} className="w-full rounded-lg border border-dashed border-white/20 py-3 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan">
        + Add Feature
      </button>
    </div>
  );
}

function TestimonialsEditor({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (c: Record<string, unknown>) => void }) {
  const testimonials = (content.testimonials as Array<{name: string; role: string; quote: string; avatar: string}>) || [];
  
  const updateTestimonial = (index: number, updates: Partial<typeof testimonials[0]>) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], ...updates };
    onUpdate({ testimonials: newTestimonials });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Section Title</label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        />
      </div>
      
      {testimonials.map((t, i) => (
        <div key={i} className="rounded-lg border border-white/10 p-4 space-y-2">
          <textarea
            value={t.quote}
            onChange={(e) => updateTestimonial(i, { quote: e.target.value })}
            placeholder="Testimonial quote"
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={t.name}
              onChange={(e) => updateTestimonial(i, { name: e.target.value })}
              placeholder="Name"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
            <input
              type="text"
              value={t.role}
              onChange={(e) => updateTestimonial(i, { role: e.target.value })}
              placeholder="Role/Title"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
          </div>
        </div>
      ))}
      
      <button
        onClick={() => onUpdate({ testimonials: [...testimonials, { name: '', role: '', quote: '', avatar: '' }] })}
        className="w-full rounded-lg border border-dashed border-white/20 py-3 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan"
      >
        + Add Testimonial
      </button>
    </div>
  );
}

function PricingEditor({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (c: Record<string, unknown>) => void }) {
  const plans = (content.plans as Array<{name: string; price: string; features: string[]; highlighted: boolean}>) || [];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Section Title</label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        />
      </div>
      
      {plans.map((plan, i) => (
        <div key={i} className={`rounded-lg border p-4 space-y-2 ${plan.highlighted ? 'border-neon-cyan bg-neon-cyan/5' : 'border-white/10'}`}>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={plan.name}
              onChange={(e) => {
                const newPlans = [...plans];
                newPlans[i].name = e.target.value;
                onUpdate({ plans: newPlans });
              }}
              placeholder="Plan name"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white font-bold"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={plan.highlighted}
                onChange={(e) => {
                  const newPlans = [...plans];
                  newPlans[i].highlighted = e.target.checked;
                  onUpdate({ plans: newPlans });
                }}
              />
              <span className="text-gray-400">Highlight</span>
            </label>
          </div>
          <input
            type="text"
            value={plan.price}
            onChange={(e) => {
              const newPlans = [...plans];
              newPlans[i].price = e.target.value;
              onUpdate({ plans: newPlans });
            }}
            placeholder="$29/month"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />
          <textarea
            value={plan.features.join('\n')}
            onChange={(e) => {
              const newPlans = [...plans];
              newPlans[i].features = e.target.value.split('\n');
              onUpdate({ plans: newPlans });
            }}
            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
          />
        </div>
      ))}
    </div>
  );
}

function CTAEditor({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Headline</label>
        <input
          type="text"
          value={(content.headline as string) || ''}
          onChange={(e) => onUpdate({ headline: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-2">Description</label>
        <textarea
          value={(content.description as string) || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Button Text</label>
          <input
            type="text"
            value={(content.buttonText as string) || ''}
            onChange={(e) => onUpdate({ buttonText: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Button Link</label>
          <input
            type="text"
            value={(content.buttonLink as string) || ''}
            onChange={(e) => onUpdate({ buttonLink: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />
        </div>
      </div>
    </div>
  );
}

function FAQEditor({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (c: Record<string, unknown>) => void }) {
  const faqs = (content.faqs as Array<{question: string; answer: string}>) || [];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Section Title</label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
        />
      </div>
      
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-lg border border-white/10 p-4 space-y-2">
          <input
            type="text"
            value={faq.question}
            onChange={(e) => {
              const newFaqs = [...faqs];
              newFaqs[i].question = e.target.value;
              onUpdate({ faqs: newFaqs });
            }}
            placeholder="Question"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white font-medium"
          />
          <textarea
            value={faq.answer}
            onChange={(e) => {
              const newFaqs = [...faqs];
              newFaqs[i].answer = e.target.value;
              onUpdate({ faqs: newFaqs });
            }}
            placeholder="Answer"
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white resize-none"
          />
        </div>
      ))}
      
      <button
        onClick={() => onUpdate({ faqs: [...faqs, { question: '', answer: '' }] })}
        className="w-full rounded-lg border border-dashed border-white/20 py-3 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan"
      >
        + Add FAQ
      </button>
    </div>
  );
}

function StatsEditor({ content, onUpdate }: { content: Record<string, unknown>; onUpdate: (c: Record<string, unknown>) => void }) {
  const stats = (content.stats as Array<{value: string; label: string}>) || [];
  
  return (
    <div className="space-y-4">
      {stats.map((stat, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={stat.value}
            onChange={(e) => {
              const newStats = [...stats];
              newStats[i].value = e.target.value;
              onUpdate({ stats: newStats });
            }}
            placeholder="10,000+"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white text-2xl font-bold"
          />
          <input
            type="text"
            value={stat.label}
            onChange={(e) => {
              const newStats = [...stats];
              newStats[i].label = e.target.value;
              onUpdate({ stats: newStats });
            }}
            placeholder="Students"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />
        </div>
      ))}
      
      <button
        onClick={() => onUpdate({ stats: [...stats, { value: '', label: '' }] })}
        className="w-full rounded-lg border border-dashed border-white/20 py-3 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan"
      >
        + Add Stat
      </button>
    </div>
  );
}
