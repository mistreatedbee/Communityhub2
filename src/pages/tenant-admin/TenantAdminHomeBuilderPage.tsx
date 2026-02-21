import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Upload,
  Save,
  Eye,
  Palette,
  Layout,
  Image as ImageIcon,
  Calendar,
  Bell,
  Users,
  BookOpen,
  Target,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { uploadLogo, getLogoUrl } from '../../lib/tenantUpload';
import { validateImageFile } from '../../lib/uploadValidation';
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
      overlayColor: 'rgba(15,23,42,0.45)',
    },
    vision: {
      enabled: true,
      title: 'Vision, Strategy, and Objectives',
      content: '- Build meaningful connections\n- Share knowledge\n- Grow community impact',
    },
    gallery: { enabled: false, images: [] },
    events: { enabled: true, title: 'Upcoming Events', showCount: 3 },
    programs: { enabled: true, title: 'Featured Programs', showCount: 3 },
    groups: { enabled: true, title: 'Featured Groups', showCount: 3, featuredGroupIds: [] },
    calendar: { enabled: false, title: 'Calendar' },
    announcements: { enabled: true, title: 'Pinned Updates' },
  },
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  vision: 'Vision/Strategy/Objectives',
  announcements: 'Announcements',
  events: 'Events',
  programs: 'Programs',
  groups: 'Groups',
  gallery: 'Gallery',
  calendar: 'Calendar',
};

export function TenantAdminHomeBuilderPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<HomeSettings>(FALLBACK);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [themeLogoUploading, setThemeLogoUploading] = useState(false);
  const themeLogoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const heroLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      try {
        const [home, groupRows] = await Promise.all([
          tenantFeaturesGet<any>(tenant.id, '/home-settings'),
          tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups'),
        ]);
        setSettings({
          ...FALLBACK,
          ...home,
          sections: {
            ...FALLBACK.sections,
            ...(home?.sections || {}),
          },
        });
        setGroups(groupRows || []);
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Failed to load home settings', 'error');
      } finally {
        setLoading(false);
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
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const result = validateImageFile(files[i]);
      if (!result.valid) {
        addToast(`${files[i].name}: ${result.error}`, 'error');
        continue;
      }
      validFiles.push(files[i]);
    }
    if (!validFiles.length) return;
    const readers = validFiles.map(
      (file, index) =>
        new Promise<{ url: string; caption?: string; order: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({ url: String(reader.result || ''), caption: file.name, order: Date.now() + index });
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
              images: [...prev.sections.gallery.images, ...images].sort((a, b) => a.order - b.order),
            },
          },
        }));
      })
      .catch(() => addToast('Failed to add one or more images', 'error'));
  };

  const handleThemeLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = validateImageFile(file);
    if (!result.valid) {
      addToast(result.error, 'error');
      e.target.value = '';
      return;
    }
    setThemeLogoUploading(true);
    try {
      const { fileId } = await uploadLogo(file);
      setSettings((prev) => ({
        ...prev,
        theme: { ...prev.theme, logoUrl: getLogoUrl(fileId) },
      }));
      addToast('Theme logo uploaded.', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Logo upload failed', 'error');
    } finally {
      setThemeLogoUploading(false);
      e.target.value = '';
    }
  };

  const setHeroImageFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = validateImageFile(file);
    if (!result.valid) {
      addToast(result.error, 'error');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSettings((prev) => ({
        ...prev,
        sections: { ...prev.sections, hero: { ...prev.sections.hero, heroImageUrl: String(reader.result || '') } },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const setHeroLogoFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = validateImageFile(file);
    if (!result.valid) {
      addToast(result.error, 'error');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSettings((prev) => ({
        ...prev,
        sections: { ...prev.sections, hero: { ...prev.sections.hero, heroLogoUrl: String(reader.result || '') } },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
      return {
        ...prev,
        sections: { ...prev.sections, gallery: { ...prev.sections.gallery, images: next } },
      };
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="space-y-6 relative animate-pulse">
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="space-y-8 relative">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Layout className="w-6 h-6 text-[var(--color-primary)]" />
              Home Page Builder
            </h1>
            <p className="text-sm text-gray-600">
              Configure the tenant member landing page shown at /c/{tenant?.slug}.
            </p>
          </div>
          <Button
            onClick={() => void save()}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            Save & Publish
          </Button>
        </div>

        {/* Theme */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--color-primary)]" />
            Theme
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Primary color"
              value={settings.theme.primaryColor || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))
              }
              placeholder="#2563eb"
              leftIcon={<div className="w-4 h-4 rounded-full" style={{ backgroundColor: settings.theme.primaryColor }} />}
            />
            <Input
              label="Secondary color"
              value={settings.theme.secondaryColor || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, theme: { ...prev.theme, secondaryColor: e.target.value } }))
              }
              placeholder="#0ea5e9"
              leftIcon={<div className="w-4 h-4 rounded-full" style={{ backgroundColor: settings.theme.secondaryColor }} />}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme logo (optional)</label>
              <p className="text-xs text-gray-500 mb-2">Upload from device (JPEG, PNG, WebP, or GIF, max 5 MB)</p>
              <input
                ref={themeLogoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleThemeLogoChange}
              />
              <div className="flex flex-wrap items-center gap-3">
                {settings.theme.logoUrl && (
                  <div className="relative inline-block">
                    <img
                      src={settings.theme.logoUrl}
                      alt="Theme logo"
                      className="w-14 h-14 rounded-lg object-contain border border-gray-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, theme: { ...prev.theme, logoUrl: '' } }))
                      }
                      className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                      aria-label="Remove theme logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => themeLogoInputRef.current?.click()}
                  disabled={themeLogoUploading}
                >
                  {themeLogoUploading ? 'Uploading...' : settings.theme.logoUrl ? 'Replace' : 'Choose file'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Order */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-[var(--color-primary)]" />
            Section order
          </h2>
          <ul className="space-y-2">
            {orderedSections.map((section, index) => (
              <li
                key={section}
                className="flex items-center justify-between gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">{SECTION_LABELS[section] || section}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveSection(section, 'up')}
                    disabled={index === 0}
                    className="w-8 h-8 p-0"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveSection(section, 'down')}
                    disabled={index === orderedSections.length - 1}
                    className="w-8 h-8 p-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--color-primary)]" />
              Hero section
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sections.hero.enabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, hero: { ...prev.sections.hero, enabled: e.target.checked } },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span>Enabled</span>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Headline"
              value={settings.sections.hero.headline}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: { ...prev.sections, hero: { ...prev.sections.hero, headline: e.target.value } },
                }))
              }
              className="md:col-span-2"
            />
            <Input
              label="Subheadline"
              value={settings.sections.hero.subheadline}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: { ...prev.sections, hero: { ...prev.sections.hero, subheadline: e.target.value } },
                }))
              }
              className="md:col-span-2"
            />
            <Input
              label="CTA label"
              value={settings.sections.hero.ctaLabel}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: { ...prev.sections, hero: { ...prev.sections.hero, ctaLabel: e.target.value } },
                }))
              }
            />
            <Input
              label="CTA link (relative path e.g. events)"
              value={settings.sections.hero.ctaLink}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: { ...prev.sections, hero: { ...prev.sections.hero, ctaLink: e.target.value } },
                }))
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background image</label>
              <p className="text-xs text-gray-500 mb-2">Upload from device (JPEG, PNG, WebP, or GIF, max 5 MB)</p>
              <input
                ref={heroImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={setHeroImageFromFile}
              />
              <div className="flex flex-wrap items-center gap-3">
                {settings.sections.hero.heroImageUrl && (
                  <div className="relative inline-block">
                    <img
                      src={settings.sections.hero.heroImageUrl}
                      alt="Hero background"
                      className="w-24 h-14 rounded-lg object-cover border border-gray-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          sections: { ...prev.sections, hero: { ...prev.sections.hero, heroImageUrl: '' } },
                        }))
                      }
                      className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                      aria-label="Remove background image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => heroImageInputRef.current?.click()}
                >
                  {settings.sections.hero.heroImageUrl ? 'Replace' : 'Choose file'}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero logo</label>
              <p className="text-xs text-gray-500 mb-2">Upload from device (JPEG, PNG, WebP, or GIF, max 5 MB)</p>
              <input
                ref={heroLogoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={setHeroLogoFromFile}
              />
              <div className="flex flex-wrap items-center gap-3">
                {settings.sections.hero.heroLogoUrl && (
                  <div className="relative inline-block">
                    <img
                      src={settings.sections.hero.heroLogoUrl}
                      alt="Hero logo"
                      className="w-14 h-14 rounded-lg object-contain border border-gray-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          sections: { ...prev.sections, hero: { ...prev.sections.hero, heroLogoUrl: '' } },
                        }))
                      }
                      className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                      aria-label="Remove hero logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => heroLogoInputRef.current?.click()}
                >
                  {settings.sections.hero.heroLogoUrl ? 'Replace' : 'Choose file'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--color-primary)]" />
              Vision / Strategy / Objectives
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sections.vision.enabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, vision: { ...prev.sections.vision, enabled: e.target.checked } },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span>Enabled</span>
            </label>
          </div>
          <Input
            label="Section title"
            value={settings.sections.vision.title}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                sections: { ...prev.sections, vision: { ...prev.sections.vision, title: e.target.value } },
              }))
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              rows={6}
              value={settings.sections.vision.content}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: { ...prev.sections, vision: { ...prev.sections.vision, content: e.target.value } },
                }))
              }
              placeholder="Enter vision content (use bullet points with - )"
            />
          </div>
        </div>

        {/* Gallery Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
              Gallery
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sections.gallery.enabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, gallery: { ...prev.sections.gallery, enabled: e.target.checked } },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span>Enabled</span>
            </label>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-600 hover:bg-gray-50/80 transition">
            <Upload className="w-4 h-4" />
            Upload images
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => uploadImages(e.target.files)} />
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {settings.sections.gallery.images.map((image, idx) => (
              <div key={`${image.url}-${idx}`} className="border border-gray-200 rounded-lg p-2 space-y-2 bg-white/50">
                <SafeImage
                  src={image.url}
                  alt={image.caption || `gallery-${idx + 1}`}
                  fallbackSrc="/image-fallback.svg"
                  className="w-full h-24 object-cover rounded"
                />
                <Input
                  value={image.caption || ''}
                  onChange={(e) =>
                    setSettings((prev) => {
                      const next = [...prev.sections.gallery.images];
                      next[idx] = { ...next[idx], caption: e.target.value };
                      return {
                        ...prev,
                        sections: { ...prev.sections, gallery: { ...prev.sections.gallery, images: next } },
                      };
                    })
                  }
                  placeholder="Caption"
                  size="sm"
                />
                <div className="flex gap-1 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveGalleryImage(idx, 'up')}
                    disabled={idx === 0}
                    className="w-7 h-7 p-0"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moveGalleryImage(idx, 'down')}
                    disabled={idx === settings.sections.gallery.images.length - 1}
                    className="w-7 h-7 p-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events & Programs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionToggleCard
            icon={<Calendar className="w-5 h-5 text-[var(--color-primary)]" />}
            title="Events section"
            enabled={settings.sections.events.enabled}
            onEnabledChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                sections: { ...prev.sections, events: { ...prev.sections.events, enabled: value } },
              }))
            }
            sectionTitle={settings.sections.events.title}
            onTitleChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                sections: { ...prev.sections, events: { ...prev.sections.events, title: value } },
              }))
            }
            showCount={settings.sections.events.showCount}
            onCountChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                sections: { ...prev.sections, events: { ...prev.sections.events, showCount: value } },
              }))
            }
          />
          <SectionToggleCard
            icon={<BookOpen className="w-5 h-5 text-[var(--color-primary)]" />}
            title="Programs section"
            enabled={settings.sections.programs.enabled}
            onEnabledChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                sections: { ...prev.sections, programs: { ...prev.sections.programs, enabled: value } },
              }))
            }
            sectionTitle={settings.sections.programs.title}
            onTitleChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                sections: { ...prev.sections, programs: { ...prev.sections.programs, title: value } },
              }))
            }
            showCount={settings.sections.programs.showCount}
            onCountChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                sections: { ...prev.sections, programs: { ...prev.sections.programs, showCount: value } },
              }))
            }
          />
        </div>

        {/* Groups Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--color-primary)]" />
              Groups section
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sections.groups.enabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, groups: { ...prev.sections.groups, enabled: e.target.checked } },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span>Enabled</span>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Section title"
              value={settings.sections.groups.title}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: { ...prev.sections, groups: { ...prev.sections.groups, title: e.target.value } },
                }))
              }
            />
            <Input
              label="Number of groups to show"
              type="number"
              min="1"
              value={String(settings.sections.groups.showCount || 3)}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: {
                    ...prev.sections,
                    groups: { ...prev.sections.groups, showCount: Number(e.target.value || 3) },
                  },
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured groups</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {groups.map((group) => (
                <label key={group._id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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
                          sections: {
                            ...prev.sections,
                            groups: { ...prev.sections.groups, featuredGroupIds: Array.from(set) },
                          },
                        };
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                  />
                  {group.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements & Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--color-primary)]" />
                Announcements
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sections.announcements.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        announcements: { ...prev.sections.announcements, enabled: e.target.checked },
                      },
                    }))
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                <span>Enabled</span>
              </label>
            </div>
            <Input
              label="Section title"
              value={settings.sections.announcements.title}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: {
                    ...prev.sections,
                    announcements: { ...prev.sections.announcements, title: e.target.value },
                  },
                }))
              }
            />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                Calendar
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sections.calendar.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sections: { ...prev.sections, calendar: { ...prev.sections.calendar, enabled: e.target.checked } },
                    }))
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                <span>Enabled</span>
              </label>
            </div>
            <Input
              label="Section title"
              value={settings.sections.calendar.title}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  sections: { ...prev.sections, calendar: { ...prev.sections.calendar, title: e.target.value } },
                }))
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

function SectionToggleCard({
  icon,
  title,
  enabled,
  onEnabledChange,
  sectionTitle,
  onTitleChange,
  showCount,
  onCountChange,
}: {
  icon?: React.ReactNode;
  title: string;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  sectionTitle: string;
  onTitleChange: (value: string) => void;
  showCount: number;
  onCountChange: (value: number) => void;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
          />
          <span>Enabled</span>
        </label>
      </div>
      <Input label="Section title" value={sectionTitle} onChange={(e) => onTitleChange(e.target.value)} />
      <Input
        label="Number to show"
        type="number"
        min="1"
        value={String(showCount || 3)}
        onChange={(e) => onCountChange(Number(e.target.value || 3))}
      />
    </div>
  );
}
