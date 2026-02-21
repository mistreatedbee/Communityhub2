import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Plus,
  BookOpen,
  Users,
  Layers,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type ProgramRow = { _id: string; title: string; description: string; status?: string };
type GroupRow = { _id: string; name: string };

type ProgramsPayload = {
  programs: ProgramRow[];
  modules: Array<{ _id: string; programId: string; title: string }>;
  assignments: Array<{ _id: string; programId: string; groupId: string }>;
};

export function TenantAdminProgramsPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState<ProgramsPayload>({ programs: [], modules: [], assignments: [] });
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<ProgramRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [programId, setProgramId] = useState('');
  const [groupId, setGroupId] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const [programsData, groupsData] = await Promise.all([
        tenantFeaturesGet<ProgramsPayload>(tenant.id, '/programs'),
        tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups'),
      ]);
      setData(programsData);
      setFilteredPrograms(programsData.programs);
      setGroups(groupsData);
      if (!programId && programsData.programs[0]) setProgramId(programsData.programs[0]._id);
      if (!groupId && groupsData[0]) setGroupId(groupsData[0]._id);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter programs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPrograms(data.programs);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = data.programs.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
    );
    setFilteredPrograms(filtered);
  }, [searchTerm, data.programs]);

  const createProgram = async () => {
    if (!tenant?.id || !title.trim()) return;
    try {
      const created = await tenantFeaturesPost<{ _id: string }>(tenant.id, '/programs', {
        title,
        description,
      });
      addToast('Program created successfully.', 'success');
      setTitle('');
      setDescription('');
      await load();
      if (created?._id && tenantSlug) {
        navigate(`/c/${tenantSlug}/admin/programs/${created._id}`);
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create program', 'error');
    }
  };

  const createModule = async () => {
    if (!tenant?.id || !programId || !moduleTitle.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/programs/modules', {
        programId,
        title: moduleTitle,
        order: 0,
      });
      addToast('Section created successfully.', 'success');
      setModuleTitle('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create section', 'error');
    }
  };

  const assign = async () => {
    if (!tenant?.id || !programId || !groupId) return;
    try {
      await tenantFeaturesPost(tenant.id, '/programs/assign', { programId, groupId });
      addToast('Program assigned to group.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to assign program', 'error');
    }
  };

  const clearSearch = () => setSearchTerm('');

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Programs</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search programs..."
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

        {/* Action cards row */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Create program */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--color-primary)]" />
              New program
            </h2>
            <Input
              placeholder="Program title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="sm"
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="sm"
            />
            <Button
              size="sm"
              className="w-full"
              onClick={() => void createProgram()}
              disabled={!title.trim()}
            >
              Create program
            </Button>
          </div>

          {/* Add section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-primary)]" />
              Add section
            </h2>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
            >
              <option value="">Select program</option>
              {data.programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            <Input
              placeholder="Section title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              size="sm"
            />
            <Button
              size="sm"
              className="w-full"
              onClick={() => void createModule()}
              disabled={!programId || !moduleTitle.trim()}
            >
              Add section
            </Button>
          </div>

          {/* Assign to group */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-primary)]" />
              Assign to group
            </h2>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Select group</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
            >
              <option value="">Select program</option>
              {data.programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              className="w-full"
              onClick={() => void assign()}
              disabled={!programId || !groupId}
            >
              Assign program
            </Button>
          </div>
        </div>

        {/* Programs count */}
        <p className="text-sm text-gray-500">
          {filteredPrograms.length} {filteredPrograms.length === 1 ? 'program' : 'programs'} found
        </p>

        {/* Programs list */}
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
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No programs found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Create your first program to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrograms.map((program) => {
              const moduleCount = data.modules.filter((m) => m.programId === program._id).length;
              const assignedGroupCount = data.assignments.filter((a) => a.programId === program._id).length;
              const status = program.status || 'ACTIVE';
              return (
                <Link
                  key={program._id}
                  to={`/c/${tenantSlug}/admin/programs/${program._id}`}
                  className="block bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      {program.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          {moduleCount} section{moduleCount !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {assignedGroupCount} group{assignedGroupCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
