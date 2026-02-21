import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Video,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { uploadTenantEventThumbnail } from '../../lib/tenantUpload';
import { validateImageFile } from '../../lib/uploadValidation';
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
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!tenant?.id || !eventId) return;
    setLoading(true);
    try {
      const data = await tenantFeaturesGet<EventRow>(tenant.id, `/events/${eventId}`);
      setEvent(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setStartsAt(data.startsAt ? new Date(data.startsAt).toISOString().slice(0, 16) : '');
      setLocation(data.location || '');
      setIsOnline(!!data.isOnline);
      setMeetingLink(data.meetingLink || '');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load event', 'error');
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, eventId, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!tenant?.id || !eventId) return;
    if (thumbnailFile) {
      const validation = validateImageFile(thumbnailFile);
      if (!validation.valid) {
        addToast(validation.error, 'error');
        return;
      }
    }
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
        ...(thumbnailFileId && { thumbnailFileId }),
        ...(thumbnailFileName !== undefined && { thumbnailFileName: thumbnailFileName || '' }),
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

  const clearThumbnailFile = () => setThumbnailFile(null);

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
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </>
    );
  }

  if (!event) {
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
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">Event not found.</p>
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

      <div className="space-y-6 relative">
        {/* Back navigation */}
        <div className="flex items-center gap-2">
          <Link
            to={`/c/${tenantSlug}/admin/events`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit event</h1>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Basic info section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
              Basic information
            </h2>
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event..."
              />
            </div>
          </div>

          {/* Date and location section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
              Date & location
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Starts at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                  />
                  <label htmlFor="isOnline" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    Online event
                  </label>
                </div>
                {isOnline ? (
                  <Input
                    label="Meeting link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    leftIcon={<Video className="w-4 h-4 text-gray-400" />}
                  />
                ) : (
                  <Input
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Community Center, Room 101"
                    leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
              Thumbnail image
            </h2>

            {/* Current thumbnail preview */}
            {(event.thumbnailFileId || event.thumbnailUrl) && !thumbnailFile && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Current thumbnail</p>
                <div className="inline-block relative">
                  {event.thumbnailFileId && tenant?.id ? (
                    <TenantFileImage
                      tenantId={tenant.id}
                      fileId={event.thumbnailFileId}
                      alt={event.title}
                      className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                      fallbackSrc="/image-fallback.svg"
                    />
                  ) : event.thumbnailUrl ? (
                    <SafeImage
                      src={event.thumbnailUrl}
                      alt={event.title}
                      className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                      fallbackSrc="/image-fallback.svg"
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* New thumbnail preview */}
            {thumbnailFile && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">New thumbnail (will replace current)</p>
                <div className="inline-block relative">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="New thumbnail preview"
                    className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    onClick={clearThumbnailFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    aria-label="Remove new thumbnail"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{thumbnailFile.name}</p>
              </div>
            )}

            {/* Upload input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload new thumbnail (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 transition"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                disabled={uploadingThumb}
              />
              {uploadingThumb && (
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={() => void save()}
              isLoading={saving || uploadingThumb}
              disabled={saving || uploadingThumb}
              leftIcon={<Save className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
