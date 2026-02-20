import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { uploadTenantEventThumbnail } from '../../lib/tenantUpload';
import { TenantFileImage } from '../../components/ui/TenantFileImage';
import { SafeImage } from '../../components/ui/SafeImage';

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
  thumbnailFileName?: string;
};

export function TenantAdminEventEditPage() {
  const { tenant } = useTenant();
  const { tenantSlug, eventId } = useParams<{ tenantSlug: string; eventId: string }>();
  const { addToast } = useToast();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!tenant?.id || !eventId) return;
    try {
      const data = await tenantFeaturesGet<EventRow>(tenant.id, `/events/${eventId}`);
      setEvent(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setStartsAt(data.startsAt ? new Date(data.startsAt).toISOString().slice(0, 16) : '');
      setLocation(data.location || '');
      setIsOnline(!!data.isOnline);
      setMeetingLink(data.meetingLink || '');
      setThumbnailUrl(data.thumbnailUrl || '');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load event', 'error');
    }
  }, [tenant?.id, eventId, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!tenant?.id || !eventId) return;
    setSaving(true);
    try {
      let thumbnailFileId: string | undefined;
      let thumbnailFileName: string | undefined;
      if (thumbnailFile) {
        setUploadingThumb(true);
        const res = await uploadTenantEventThumbnail(tenant.id, thumbnailFile);
        thumbnailFileId = res.fileId;
        thumbnailFileName = res.fileName;
        setUploadingThumb(false);
      } else if (event?.thumbnailFileId) {
        thumbnailFileId = event.thumbnailFileId;
        thumbnailFileName = event.thumbnailFileName;
      }
      await tenantFeaturesPut(tenant.id, `/events/${eventId}`, {
        title,
        description,
        startsAt: new Date(startsAt).toISOString(),
        location,
        isOnline,
        meetingLink,
        thumbnailUrl,
        ...(thumbnailFileId && { thumbnailFileId }),
        ...(thumbnailFileName !== undefined && { thumbnailFileName: thumbnailFileName || '' })
      });
      addToast('Event updated', 'success');
      setThumbnailFile(null);
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update event', 'error');
    } finally {
      setSaving(false);
      setUploadingThumb(false);
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/c/${tenantSlug}/admin/events`}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to Events
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Edit event</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Input label="Starts At" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or address" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail image (optional)</label>
          {event.thumbnailFileId && tenant?.id ? (
            <div className="mb-2">
              <TenantFileImage
                tenantId={tenant.id}
                fileId={event.thumbnailFileId}
                alt={event.title}
                className="w-24 h-24 rounded object-cover"
                fallbackSrc="/image-fallback.svg"
              />
            </div>
          ) : event.thumbnailUrl ? (
            <SafeImage src={event.thumbnailUrl} alt={event.title} className="w-24 h-24 rounded object-cover mb-2" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            disabled={uploadingThumb}
          />
          {thumbnailFile && <p className="mt-1 text-sm text-gray-600">New thumbnail: {thumbnailFile.name}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
          Online event
        </label>
        {isOnline && (
          <Input label="Meeting link" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
        )}
        <Button onClick={() => void save()} isLoading={saving || uploadingThumb} disabled={saving || uploadingThumb}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
