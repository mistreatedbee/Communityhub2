import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';

type GroupRow = { _id: string; name: string };

type HomeSettings = {
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  sections: {
    sectionOrder: string[];
    hero: {
      enabled: boolean;
      headline: string;
      subheadline: string;
      ctaLabel: string;
      ctaLink: string;
      heroImageUrl?: string;
      heroLogoUrl?: string;
      overlayColor?: string;
    };
    vision: { enabled: boolean; title: string; content: string };
    gallery: { enabled: boolean; images: Array<{ url: string; caption?: string; order: number }> };
    events: { enabled: boolean; title: string; showCount: number };
    programs: { enabled: boolean; title: string; showCount: number };
    groups: { enabled: boolean; title: string; showCount: number; featuredGroupIds: string[] };
    calendar: { enabled: boolean; title: string };
    announcements: { enabled: boolean; title: string };
  };
};

const FALLBACK: HomeSettings = {
  theme: { primaryColor: '#2563eb', secondaryColor: '#0ea5e9', logoUrl: '' },
  sections: {
    sectionOrder: ['hero', 'vision', 'announcements', 'events', 'programs', 'groups', 'gallery'],
    hero: {
      enabled: true,
      headline: 'Welcome to our community',
      subheadline: 'Connect, learn, and grow together.',
      ctaLabel: 'Explore events',
      ctaLink: 'events',
      heroImageUrl: '',
      heroLogoUrl: '',
      overlayColor: 'rgba(15,23,42,0.45)'
    },
    vision: {
      enabled: true,
      title: 'Vision, Strategy, and Objectives',
      content: '- Build meaningful connections\n- Share knowledge\n- Grow community impact'
    },
    gallery: { enabled: false, images: [] },
    events: { enabled: true, title: 'Upcoming Events', showCount: 3 },
    programs: { enabled: true, title: 'Featured Programs', showCount: 3 },
    groups: { enabled: true, title: 'Featured Groups', showCount: 3, featuredGroupIds: [] },
    calendar: { enabled: false, title: 'Calendar' },
    announcements: { enabled: true, title: 'Pinned Updates' }
  }
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  vision: 'Vision/Strategy/Objectives',
  announcements: 'Announcements',
  events: 'Events',
  programs: 'Programs',
  groups: 'Groups',
  gallery: 'Gallery',
  calendar: 'Calendar'
};

export function TenantAdminHomeBuilderPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<HomeSettings>(FALLBACK);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      try {
        const [home, groupRows] = await Promise.all([
          tenantFeaturesGet<any>(tenant.id, '/home-settings'),
          tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups')
        ]);
        setSettings({
          ...FALLBACK,
          ...home,
          sections: {
            ...FALLBACK.sections,
            ...(home?.sections || {})
          }
        });
        setGroups(groupRows || []);
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Failed to load home settings', 'error');
      }
    };
    void load();
  }, [tenant?.id, addToast]);

  const orderedSections = useMemo(() => settings.sections.sectionOrder || [], [settings.sections.sectionOrder]);

  const moveSection = (section: string, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const list = [...prev.sections.sectionOrder];
      const index = list.indexOf(section);
      if (index < 0) return prev;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= list.length) return prev;
      [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
      return { ...prev, sections: { ...prev.sections, sectionOrder: list } };
    });
  };

  const uploadImages = (files: FileList | null) => {
    if (!files?.length) return;
    const readers = Array.from(files).map(
      (file, index) =>
        new Promise<{ url: string; caption?: string; order: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ url: String(reader.result || ''), caption: file.name, order: Date.now() + index });
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers)
      .then((images) => {
        setSettings((prev) => ({
          ...prev,
          sections: {
            ...prev.sections,
            gallery: {
              ...prev.sections.gallery,
              images: [...prev.sections.gallery.images, ...images].sort((a, b) => a.order - b.order)
            }
          }
        }));
      })
      .catch(() => addToast('Failed to upload one or more images', 'error'));
  };

  const save = async () => {
    if (!tenant?.id) return;
    setSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, '/home-settings', settings);
      addToast('Home page settings published successfully', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to save home settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const next = [...prev.sections.gallery.images];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, sections: { ...prev.sections, gallery: { ...prev.sections.gallery, images: next } } };
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Page Builder</h1>
          <p className="text-sm text-gray-600">Configure the tenant member landing page shown at /c/{tenant?.slug}/app.</p>
        </div>
        <Button onClick={() => void save()} isLoading={saving}>Save & Publish</Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Theme</h2>
        <Input
          label="Primary color"
          value={settings.theme.primaryColor || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
          placeholder="#2563eb"
        />
        <Input
          label="Secondary color"
          value={settings.theme.secondaryColor || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, theme: { ...prev.theme, secondaryColor: e.target.value } }))}
          placeholder="#0ea5e9"
        />
        <Input
          label="Logo URL (optional)"
          value={settings.theme.logoUrl || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, theme: { ...prev.theme, logoUrl: e.target.value } }))}
          placeholder="https://..."
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Section order</h2>
        <ul className="space-y-2">
          {orderedSections.map((section, index) => (
            <li key={section} className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg p-2">
              <span className="text-sm text-gray-700">{SECTION_LABELS[section] || section}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => moveSection(section, 'up')} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => moveSection(section, 'down')} disabled={index === orderedSections.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.sections.hero.enabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, hero: { ...prev.sections.hero, enabled: e.target.checked } } }))}
          />
          Enable Hero section
        </label>
        <Input label="Hero headline" value={settings.sections.hero.headline} onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, hero: { ...prev.sections.hero, headline: e.target.value } } }))} />
        <Input label="Hero subheadline" value={settings.sections.hero.subheadline} onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, hero: { ...prev.sections.hero, subheadline: e.target.value } } }))} />
        <Input label="CTA label" value={settings.sections.hero.ctaLabel} onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, hero: { ...prev.sections.hero, ctaLabel: e.target.value } } }))} />
        <Input label="CTA link (relative path e.g. events)" value={settings.sections.hero.ctaLink} onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, hero: { ...prev.sections.hero, ctaLink: e.target.value } } }))} />
        <Input label="Hero background image URL" value={settings.sections.hero.heroImageUrl || ''} onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, hero: { ...prev.sections.hero, heroImageUrl: e.target.value } } }))} />
        <Input label="Hero logo image URL" value={settings.sections.hero.heroLogoUrl || ''} onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, hero: { ...prev.sections.hero, heroLogoUrl: e.target.value } } }))} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.sections.vision.enabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, vision: { ...prev.sections.vision, enabled: e.target.checked } } }))}
          />
          Enable Vision/Strategy/Objectives section
        </label>
        <Input label="Section title" value={settings.sections.vision.title} onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, vision: { ...prev.sections.vision, title: e.target.value } } }))} />
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          rows={6}
          value={settings.sections.vision.content}
          onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, vision: { ...prev.sections.vision, content: e.target.value } } }))}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.sections.gallery.enabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, gallery: { ...prev.sections.gallery, enabled: e.target.checked } } }))}
          />
          Enable Gallery section
        </label>
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-600 hover:bg-gray-50">
          <Upload className="w-4 h-4" />
          Upload images
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => uploadImages(e.target.files)} />
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {settings.sections.gallery.images.map((image, idx) => (
            <div key={`${image.url}-${idx}`} className="border border-gray-200 rounded-lg p-2 space-y-2">
              <SafeImage src={image.url} alt={image.caption || `gallery-${idx + 1}`} fallbackSrc="/image-fallback.svg" className="w-full h-24 object-cover rounded" />
              <Input
                value={image.caption || ''}
                onChange={(e) =>
                  setSettings((prev) => {
                    const next = [...prev.sections.gallery.images];
                    next[idx] = { ...next[idx], caption: e.target.value };
                    return { ...prev, sections: { ...prev.sections, gallery: { ...prev.sections.gallery, images: next } } };
                  })
                }
                placeholder="Caption"
              />
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => moveGalleryImage(idx, 'up')} disabled={idx === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => moveGalleryImage(idx, 'down')} disabled={idx === settings.sections.gallery.images.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionToggleCard
          title="Events section"
          enabled={settings.sections.events.enabled}
          onEnabledChange={(value) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, events: { ...prev.sections.events, enabled: value } } }))}
          sectionTitle={settings.sections.events.title}
          onTitleChange={(value) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, events: { ...prev.sections.events, title: value } } }))}
          showCount={settings.sections.events.showCount}
          onCountChange={(value) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, events: { ...prev.sections.events, showCount: value } } }))}
        />
        <SectionToggleCard
          title="Programs section"
          enabled={settings.sections.programs.enabled}
          onEnabledChange={(value) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, programs: { ...prev.sections.programs, enabled: value } } }))}
          sectionTitle={settings.sections.programs.title}
          onTitleChange={(value) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, programs: { ...prev.sections.programs, title: value } } }))}
          showCount={settings.sections.programs.showCount}
          onCountChange={(value) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, programs: { ...prev.sections.programs, showCount: value } } }))}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.sections.groups.enabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, groups: { ...prev.sections.groups, enabled: e.target.checked } } }))}
          />
          Enable Groups section
        </label>
        <Input
          label="Groups section title"
          value={settings.sections.groups.title}
          onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, groups: { ...prev.sections.groups, title: e.target.value } } }))}
        />
        <Input
          label="Groups to show"
          type="number"
          value={String(settings.sections.groups.showCount || 3)}
          onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, groups: { ...prev.sections.groups, showCount: Number(e.target.value || 3) } } }))}
        />
        <label className="block text-sm font-medium text-gray-700">Featured groups</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {groups.map((group) => (
            <label key={group._id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={settings.sections.groups.featuredGroupIds.includes(group._id)}
                onChange={(e) =>
                  setSettings((prev) => {
                    const set = new Set(prev.sections.groups.featuredGroupIds);
                    if (e.target.checked) set.add(group._id);
                    else set.delete(group._id);
                    return {
                      ...prev,
                      sections: { ...prev.sections, groups: { ...prev.sections.groups, featuredGroupIds: Array.from(set) } }
                    };
                  })
                }
              />
              {group.name}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.sections.announcements.enabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, announcements: { ...prev.sections.announcements, enabled: e.target.checked } } }))}
          />
          Show announcements / pinned updates
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.sections.calendar.enabled}
            onChange={(e) => setSettings((prev) => ({ ...prev, sections: { ...prev.sections, calendar: { ...prev.sections.calendar, enabled: e.target.checked } } }))}
          />
          Show calendar/upcoming schedule section
        </label>
      </div>
    </div>
  );
}

function SectionToggleCard({
  title,
  enabled,
  onEnabledChange,
  sectionTitle,
  onTitleChange,
  showCount,
  onCountChange
}: {
  title: string;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  sectionTitle: string;
  onTitleChange: (value: string) => void;
  showCount: number;
  onCountChange: (value: number) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} />
        Enable {title}
      </label>
      <Input label="Section title" value={sectionTitle} onChange={(e) => onTitleChange(e.target.value)} />
      <Input label="Show count" type="number" value={String(showCount || 3)} onChange={(e) => onCountChange(Number(e.target.value || 3))} />
    </div>
  );
}
