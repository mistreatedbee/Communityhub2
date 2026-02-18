import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type Resource = {
  _id: string;
  title: string;
  description: string;
  url: string;
  type: string;
};

export function TenantAdminResourcesPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { addToast } = useToast();
  const [items, setItems] = useState<Resource[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    try {
      setItems(await tenantFeaturesGet<Resource[]>(tenant.id, '/resources'));
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load resources', 'error');
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !title.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/resources', {
        title,
        description,
        url,
        type: 'link'
      });
      addToast('Resource created successfully.', 'success');
      setTitle('');
      setDescription('');
      setUrl('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create resource', 'error');
    }
  };

  const remove = async (id: string) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesDelete(tenant.id, `/resources/${id}`);
      addToast('Resource deleted.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete resource', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button onClick={() => void create()}>Add resource</Button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between gap-3 items-center"
          >
            <Link
              to={`/c/${tenantSlug}/admin/resources/${item._id}`}
              className="flex-1 min-w-0 hover:opacity-90"
            >
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              {item.url ? (
                <a
                  className="text-sm text-[var(--color-primary)]"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open link
                </a>
              ) : null}
            </Link>
            <Button variant="ghost" className="text-red-600 shrink-0" onClick={() => void remove(item._id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
