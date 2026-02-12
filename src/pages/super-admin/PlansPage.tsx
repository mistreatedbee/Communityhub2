import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';

type Plan = {
  _id: string;
  name: string;
  description: string;
  maxMembers: number;
  maxAdmins: number;
  featureFlags: Record<string, unknown>;
};

type License = {
  _id: string;
  key: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CLAIMED';
  singleUse: boolean;
  expiresAt: string | null;
  planId?: { name?: string };
};

export function PlansPage() {
  const { addToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(100);
  const [maxAdmins, setMaxAdmins] = useState(3);
  const [featureFlags, setFeatureFlags] = useState('');
  const [planIdForKey, setPlanIdForKey] = useState('');

  const load = async () => {
    const [planRows, licenseRows] = await Promise.all([
      apiClient<Plan[]>('/api/plans'),
      apiClient<License[]>('/api/licenses')
    ]);
    setPlans(planRows);
    setLicenses(licenseRows);
    if (!planIdForKey && planRows.length > 0) setPlanIdForKey(planRows[0]._id);
  };

  useEffect(() => {
    void load();
  }, []);

  const savePlan = async () => {
    const payload = {
      name,
      description,
      maxMembers,
      maxAdmins,
      featureFlags: featureFlags
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
        .reduce<Record<string, boolean>>((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
    };

    if (editing) {
      await apiClient(`/api/plans/${editing._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      addToast('Plan updated', 'success');
    } else {
      await apiClient('/api/plans', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      addToast('Plan created', 'success');
    }

    setIsOpen(false);
    setEditing(null);
    await load();
  };

  const removePlan = async (id: string) => {
    if (!window.confirm('Delete this plan?')) return;
    await apiClient(`/api/plans/${id}`, { method: 'DELETE' });
    await load();
  };

  const generateLicense = async () => {
    await apiClient('/api/licenses/generate', {
      method: 'POST',
      body: JSON.stringify({ planId: planIdForKey, singleUse: true })
    });
    addToast('License generated', 'success');
    await load();
  };

  const suspendLicense = async (id: string) => {
    await apiClient(`/api/licenses/${id}/suspend`, { method: 'PUT' });
    await load();
  };

  const openForEdit = (plan?: Plan) => {
    if (plan) {
      setEditing(plan);
      setName(plan.name);
      setDescription(plan.description || '');
      setMaxMembers(plan.maxMembers);
      setMaxAdmins(plan.maxAdmins);
      setFeatureFlags(Object.keys(plan.featureFlags || {}).join(','));
    } else {
      setEditing(null);
      setName('');
      setDescription('');
      setMaxMembers(100);
      setMaxAdmins(3);
      setFeatureFlags('');
    }
    setIsOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans & Licenses</h1>
          <p className="text-gray-500">Manage plans and keys.</p>
        </div>
        <Button onClick={() => openForEdit()}>Create Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id}>
            <CardHeader className="font-semibold">{plan.name}</CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">{plan.description || 'No description'}</p>
              <p className="text-sm text-gray-600">Members: {plan.maxMembers}</p>
              <p className="text-sm text-gray-600">Admins: {plan.maxAdmins}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openForEdit(plan)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => void removePlan(plan._id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Licenses</h3>
          <div className="flex gap-2 items-center">
            <select
              className="rounded-lg border border-gray-300 p-2 text-sm"
              value={planIdForKey}
              onChange={(e) => setPlanIdForKey(e.target.value)}
            >
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <Button onClick={() => void generateLicense()}>Generate</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Key</TableHeader>
                <TableHeader>Plan</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Expires</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license._id}>
                  <TableCell className="font-mono">{license.key}</TableCell>
                  <TableCell>{license.planId?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={license.status === 'ACTIVE' ? 'success' : 'default'}>{license.status}</Badge>
                  </TableCell>
                  <TableCell>{license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell>
                    {license.status === 'ACTIVE' && (
                      <Button size="sm" variant="ghost" onClick={() => void suspendLicense(license._id)}>
                        Suspend
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? 'Edit Plan' : 'Create Plan'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void savePlan()}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Max Members" type="number" value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} />
          <Input label="Max Admins" type="number" value={maxAdmins} onChange={(e) => setMaxAdmins(Number(e.target.value))} />
          <Input
            label="Feature Flags (comma-separated)"
            value={featureFlags}
            onChange={(e) => setFeatureFlags(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
