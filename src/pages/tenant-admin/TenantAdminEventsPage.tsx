import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  X,
  Plus,
  Calendar,
  MapPin,
  Video,
  Image as ImageIcon,
  Trash2,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import {
  tenantFeaturesDelete,
  tenantFeaturesGet,
  tenantFeaturesPost,
} from '../../lib/tenantFeatures';
import { uploadTenantEventThumbnail } from '../../lib/tenantUpload';
import { validateImageFile } from '../../lib/uploadValidation';
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
  const [filteredItems, setFilteredItems] = useState<EventRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const rows = await tenantFeaturesGet<EventRow[]>(tenant.id, '/events');
      setItems(rows);
      setFilteredItems(rows);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter events based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const create = async () => {
    if (!tenant?.id || !title.trim() || !startsAt) return;
    if (thumbnailFile) {
      const validation = validateImageFile(thumbnailFile);
      if (!validation.valid) {
        addToast(validation.error, 'error');
        return;
      }
    }
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
        thumbnailFileId,
        thumbnailFileName: thumbnailFileName || '',
      });
      addToast('Event created', 'success');
      setTitle('');
      setDescription('');
      setStartsAt('');
      setLocation('');
      setIsOnline(false);
      setMeetingLink('');
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

  const clearSearch = () => setSearchTerm('');

  // Helper to determine if event is upcoming
  const isUpcoming = (dateStr: string) => new Date(dateStr) > new Date();

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
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Events</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 w-full sm:w-64"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Create event form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
            Create new event
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
            <Input
              label="Starts at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
            />
          </div>
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

          {/* Location / Online toggle */}
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

          {/* Thumbnail upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 transition"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              disabled={uploadingThumb}
            />
            {thumbnailFile && (
              <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                {thumbnailFile.name}
              </p>
            )}
          </div>

          <Button
            onClick={() => void create()}
            disabled={uploadingThumb || !title.trim() || !startsAt}
            className="w-full sm:w-auto"
          >
            {uploadingThumb ? 'Uploading...' : 'Create event'}
          </Button>
        </div>

        {/* Events count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'event' : 'events'} found
        </p>

        {/* Events list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No events found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Create your first event to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((event) => {
              const upcoming = isUpcoming(event.startsAt);
              return (
                <div
                  key={event._id}
                  onClick={() => navigate(`/c/${tenantSlug}/admin/events/${event._id}`)}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="shrink-0">
                      {event.thumbnailFileId && tenant?.id ? (
                        <TenantFileImage
                          tenantId={tenant.id}
                          fileId={event.thumbnailFileId}
                          alt={event.title}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                          fallbackSrc="/image-fallback.svg"
                        />
                      ) : event.thumbnailUrl ? (
                        <SafeImage
                          src={event.thumbnailUrl}
                          alt={event.title}
                          fallbackSrc="/image-fallback.svg"
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                          <Calendar className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            upcoming
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {upcoming ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.startsAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {event.isOnline ? (
                          <span className="flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" />
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          void remove(event._id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Delete
                      </Button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
