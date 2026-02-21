import React, { useEffect, useMemo, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';
import { MemberPageContainer, PageHeader, ContentCard } from '../../components/member';
import { FileText, Image, Link as LinkIcon, File } from 'lucide-react';

type Resource = {
  _id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  type?: string;
  mimeType?: string;
  fileName?: string;
  folder?: string;
};

function getResourceTypeLabel(res: Resource): string {
  const type = (res.type || '').toLowerCase();
  const mime = (res.mimeType || '').toLowerCase();
  if (type === 'link' || mime === '' || mime.startsWith('text/html')) return 'Link';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('image')) return 'Image';
  if (mime.includes('word') || mime.includes('document') || mime.includes('msword')) return 'Doc';
  if (mime.includes('sheet') || mime.includes('excel')) return 'Sheet';
  return 'File';
}

function ResourceTypeIcon({ res }: { res: Resource }) {
  const label = getResourceTypeLabel(res);
  if (label === 'PDF') return <FileText className="w-5 h-5 text-red-600" />;
  if (label === 'Image') return <Image className="w-5 h-5 text-emerald-600" />;
  if (label === 'Link') return <LinkIcon className="w-5 h-5 text-blue-600" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

export function TenantMemberResourcesPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setItems(await tenantFeaturesGet<Resource[]>(tenant.id, '/resources'));
    };
    void load();
  }, [tenant?.id]);

  const filtered = useMemo(() => {
    let list = items;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          (r.fileName || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      list = list.filter((r) => getResourceTypeLabel(r) === typeFilter);
    }
    return list;
  }, [items, search, typeFilter]);

  const typeOptions = useMemo(() => {
    const set = new Set(items.map(getResourceTypeLabel));
    return Array.from(set).sort();
  }, [items]);

  return (
    <MemberPageContainer>
      <PageHeader
        title="Resources"
        subtitle="Files and links shared with the community."
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
        {typeOptions.length > 0 && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            <option value="">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <p className="text-gray-500 sm:col-span-2 lg:col-span-3">
            {items.length === 0 ? 'No resources yet.' : 'No resources match your search.'}
          </p>
        )}
        {filtered.map((item) => (
          <ContentCard key={item._id} className="flex flex-col">
            <div className="flex gap-3">
              {item.thumbnailUrl ? (
                <SafeImage
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fallbackSrc="/image-fallback.svg"
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <ResourceTypeIcon res={item} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {getResourceTypeLabel(item)}
                </span>
                <h2 className="font-semibold text-gray-900 mt-0.5">{item.title}</h2>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{item.description}</p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium transition-colors hover:opacity-90"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {getResourceTypeLabel(item) === 'Link' ? 'Open link' : 'Open / Download'}
                  </a>
                )}
              </div>
            </div>
          </ContentCard>
        ))}
      </div>
    </MemberPageContainer>
  );
}
