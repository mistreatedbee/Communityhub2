import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  const [items, setItems] = useState<Field[]>([]);
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    setItems(await tenantFeaturesGet<Field[]>(tenant.id, '/registration-fields'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !key.trim() || !label.trim()) return;
    await tenantFeaturesPost(tenant.id, '/registration-fields', {
      key,
      label,
      fieldType: 'TEXT',
      required: false,
      options: [],
      fieldOrder: items.length,
      isActive: true
    });
    setKey('');
    setLabel('');
    await load();
  };

  const toggle = async (field: Field) => {
    if (!tenant?.id) return;
    await tenantFeaturesPut(tenant.id, `/registration-fields/${field._id}`, { isActive: !field.isActive });
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Registration Form</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Field key" value={key} onChange={(e) => setKey(e.target.value)} />
        <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Button onClick={() => void create()}>Add field</Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between">
            <div>
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-600">key: {item.key}</p>
            </div>
            <Button variant="outline" onClick={() => void toggle(item)}>{item.isActive ? 'Disable' : 'Enable'}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
