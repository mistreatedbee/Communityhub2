import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Search,
  X,
  Plus,
  Globe,
  Lock,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type GroupRow = {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
};

export function TenantAdminGroupsPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { addToast } = useToast();
  const [items, setItems] = useState<GroupRow[]>([]);
  const [filteredItems, setFilteredItems] = useState<GroupRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Create form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const rows = await tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups');
      setItems(rows);
      setFilteredItems(rows);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter groups based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const create = async () => {
    if (!tenant?.id || !name.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/groups', { name, description, isPrivate });
      addToast('Group created successfully.', 'success');
      setName('');
      setDescription('');
      setIsPrivate(false);
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create group', 'error');
    }
  };

  const clearSearch = () => setSearchTerm('');

  return (
    <>
      {/* Animated background – subtle for admin area */}
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Groups</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search groups..."
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

        {/* Create group form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
            Create new group
          </h2>
          <Input
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Marketing Team"
            required
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group about?"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50/50 transition">
                <input
                  type="radio"
                  name="privacy"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Public</p>
                  <p className="text-xs text-gray-500">Anyone in the community can see and join</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50/50 transition">
                <input
                  type="radio"
                  name="privacy"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                <Lock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Private</p>
                  <p className="text-xs text-gray-500">Only members of the group can see it</p>
                </div>
              </label>
            </div>
          </div>
          <Button
            onClick={() => void create()}
            disabled={!name.trim()}
            className="w-full sm:w-auto"
          >
            Create group
          </Button>
        </div>

        {/* Groups count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'group' : 'groups'} found
        </p>

        {/* Groups list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No groups found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Create your first group to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((group) => (
              <Link
                key={group._id}
                to={`/c/${tenantSlug}/admin/groups/${group._id}`}
                className="block bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          group.isPrivate
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}
                      >
                        {group.isPrivate ? (
                          <>
                            <Lock className="w-3 h-3" />
                            Private
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3" />
                            Public
                          </>
                        )}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
