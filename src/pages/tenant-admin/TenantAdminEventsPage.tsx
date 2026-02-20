import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';
import { uploadTenantEventThumbnail } from '../../lib/tenantUpload';
import { SafeImage } from '../../components/ui/SafeImage';
import { TenantFileImage } from '../../components/ui/TenantFileImage';

type EventRow = {
  _id: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  isOnline?: boolean;
  meetingLink?: string;
  thumbnailUrl?: string;
  thumbnailFileId?: string;
};

export function TenantAdminEventsPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState<EventRow[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    try {
      setItems(await tenantFeaturesGet<EventRow[]>(tenant.id, '/events'));
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load events', 'error');
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !title.trim() || !startsAt) return;
    setUploadingThumb(true);
    try {
      let thumbnailFileId: string | undefined;
      let thumbnailFileName: string | undefined;
      if (thumbnailFile) {
        const res = await uploadTenantEventThumbnail(tenant.id, thumbnailFile);
        thumbnailFileId = res.fileId;
        thumbnailFileName = res.fileName;
      }
      const created = await tenantFeaturesPost<{ _id: string }>(tenant.id, '/events', {
        title,
        description,
        startsAt: new Date(startsAt).toISOString(),
        location,
        isOnline,
        meetingLink: isOnline ? meetingLink : '',
        thumbnailUrl: thumbnailUrl || '',
        thumbnailFileId,
        thumbnailFileName: thumbnailFileName || ''
      });
      addToast('Event created', 'success');
      setTitle('');
      setDescription('');
      setStartsAt('');
      setLocation('');
      setIsOnline(false);
      setMeetingLink('');
      setThumbnailUrl('');
      setThumbnailFile(null);
      await load();
      if (created?._id && tenantSlug) {
        navigate(`/c/${tenantSlug}/admin/events/${created._id}`);
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create event', 'error');
    } finally {
      setUploadingThumb(false);
    }
  };

  const remove = async (id: string) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesDelete(tenant.id, `/events/${id}`);
      addToast('Event deleted', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete event', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Events</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Input label="Starts At" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail image (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            disabled={uploadingThumb}
          />
          {thumbnailFile && <p className="mt-1 text-sm text-gray-600">Selected: {thumbnailFile.name}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
          Online event
        </label>
        {isOnline && (
          <Input label="Meeting link" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
        )}
        <Button onClick={() => void create()} disabled={uploadingThumb}>Create event</Button>
      </div>
      <div className="space-y-3">
        {items.map((e) => (
          <div
            key={e._id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/c/${tenantSlug}/admin/events/${e._id}`)}
            onKeyDown={(ev) => ev.key === 'Enter' && navigate(`/c/${tenantSlug}/admin/events/${e._id}`)}
            className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[var(--color-primary)] hover:shadow-sm transition-colors flex gap-3"
          >
            {e.thumbnailFileId && tenant?.id ? (
              <TenantFileImage
                tenantId={tenant.id}
                fileId={e.thumbnailFileId}
                alt={e.title}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
                fallbackSrc="/image-fallback.svg"
              />
            ) : e.thumbnailUrl ? (
              <SafeImage src={e.thumbnailUrl} alt={e.title} fallbackSrc="/image-fallback.svg" className="w-16 h-16 rounded-lg object-cover shrink-0" />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{e.title}</p>
              <p className="text-sm text-gray-600 line-clamp-1">{e.description}</p>
              <p className="text-xs text-gray-500">{new Date(e.startsAt).toLocaleString()}</p>
              {e.isOnline && e.meetingLink ? (
                <a href={e.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-primary)] hover:underline" onClick={(ev) => ev.stopPropagation()}>
                  Join meeting
                </a>
              ) : null}
            </div>
            <Button variant="ghost" className="text-red-600 shrink-0" onClick={(ev) => { ev.stopPropagation(); void remove(e._id); }}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
