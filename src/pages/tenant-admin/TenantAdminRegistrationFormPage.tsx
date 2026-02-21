import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  Plus,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Field = {
  _id: string;
  key: string;
  label: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX';
  required: boolean;
  options: string[];
  fieldOrder: number;
  isActive: boolean;
};

export function TenantAdminRegistrationFormPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<Field[]>([]);
  const [filteredItems, setFilteredItems] = useState<Field[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const fields = await tenantFeaturesGet<Field[]>(tenant.id, '/registration-fields');
      setItems(fields);
      setFilteredItems(fields);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load fields', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter fields based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.key.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const create = async () => {
    if (!tenant?.id || !key.trim() || !label.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/registration-fields', {
        key,
        label,
        fieldType: 'TEXT',
        required: false,
        options: [],
        fieldOrder: items.length,
        isActive: true,
      });
      addToast('Field added successfully.', 'success');
      setKey('');
      setLabel('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to add field', 'error');
    }
  };

  const toggle = async (field: Field) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesPut(tenant.id, `/registration-fields/${field._id}`, {
        isActive: !field.isActive,
      });
      addToast(`Field ${field.isActive ? 'disabled' : 'enabled'}.`, 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to toggle field', 'error');
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Registration Form</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search fields..."
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

        {/* Create field form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
            Add new field
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Field key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g., phoneNumber"
              required
            />
            <Input
              label="Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Phone number"
              required
            />
          </div>
          <p className="text-xs text-gray-500">
            New fields will be of type <span className="font-mono">TEXT</span> and optional by default.
          </p>
          <Button
            onClick={() => void create()}
            disabled={!key.trim() || !label.trim()}
            className="w-full sm:w-auto"
          >
            Add field
          </Button>
        </div>

        {/* Fields count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'field' : 'fields'} found
        </p>

        {/* Fields list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No fields found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Add your first custom field to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((field) => (
              <div
                key={field._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          field.isActive
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {field.isActive ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {field.fieldType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Key: <span className="font-mono">{field.key}</span>
                    </p>
                    {field.required && (
                      <p className="text-xs text-amber-600 mt-1">Required</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void toggle(field)}
                      leftIcon={field.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    >
                      {field.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
