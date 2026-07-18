"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fetchApi } from "@/services/apiClient";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Activity,
  X,
  Loader2,
  ShieldCheck,
  Key,
  Copy,
  CheckCircle2
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import toast from "react-hot-toast";

interface Tenant {
  id: string;
  code: string;
  name: string;
  level: string;
  status: string;
  registrationKey?: string;
  createdAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; idToSuspend: string | null }>({
    isOpen: false,
    idToSuspend: null,
  });
  const [newKeyModal, setNewKeyModal] = useState<{ isOpen: boolean; orgName: string; regKey: string }>({
    isOpen: false,
    orgName: "",
    regKey: "",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    level: "municipality",
    sysAdminEmail: "",
  });

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Tenant[]>("/tenants");
      setTenants(data);
    } catch (e) {
      console.error("Failed to load tenants", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetchApi<Tenant>("/tenants", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ code: "", name: "", level: "municipality", sysAdminEmail: "" });
      
      // Show the generated registration key modal
      if (response.registrationKey) {
        setNewKeyModal({
          isOpen: true,
          orgName: response.name,
          regKey: response.registrationKey
        });
      }

      toast.success("Tenant registered successfully!");
      loadTenants();
    } catch (e: any) {
      toast.error(e.message || "Failed to register tenant");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSuspendClick = (id: string) => {
    setConfirmState({ isOpen: true, idToSuspend: id });
  };

  const handleSuspendConfirm = async () => {
    if (!confirmState.idToSuspend) return;
    try {
      await fetchApi(`/tenants/${confirmState.idToSuspend}/suspend`, { method: "PUT" });
      setConfirmState({ isOpen: false, idToSuspend: null });
      loadTenants();
      toast.success("Tenant suspended successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to suspend tenant");
      setConfirmState({ isOpen: false, idToSuspend: null });
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Tenant Organizations
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Register and manage LGUs and their system administrators.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register LGU Tenant
        </button>
      </div>

      <div className="bg-surface p-4 rounded-t-2xl border border-b-0 border-text-secondary/10 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-secondary" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-text-secondary/20 rounded-lg bg-background text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface border border-text-secondary/10 rounded-b-2xl shadow-sm min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading tenants...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No LGU tenants found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-text-secondary/10">
            <thead className="bg-background/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Organization</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Registration Key</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-secondary/10">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-background/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3 font-bold uppercase">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{t.name}</div>
                        <div className="text-xs text-text-secondary">Code: {t.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                      {t.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.registrationKey ? (
                      <div className="flex items-center space-x-2">
                        <code className="text-xs font-mono bg-background px-2 py-1 rounded border border-text-secondary/20 text-text-secondary w-32 truncate" title={t.registrationKey}>
                          {t.registrationKey}
                        </code>
                        <button
                          onClick={() => copyToClipboard(t.registrationKey!)}
                          className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Copy Key"
                        >
                          {copiedKey === t.registrationKey ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary italic">Not available</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {format(new Date(t.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {t.status === 'active' && (
                      <button
                        onClick={() => handleSuspendClick(t.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-xl border border-text-secondary/10 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-text-secondary/10 flex justify-between items-center bg-background/50">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary" />
                Register LGU Tenant
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTenant} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Organization Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. City of San Juan"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-text-secondary/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Organization Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. sanjuan"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-text-secondary/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-text-secondary">Unique identifier. Alphanumeric only, no spaces.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-text-secondary/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="province">Province</option>
                  <option value="city">City</option>
                  <option value="municipality">Municipality</option>
                  <option value="barangay">Barangay</option>
                </select>
              </div>
              
              <div className="pt-4 mt-4 border-t border-text-secondary/10 space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-primary" />
                  Initial SysAdmin Account
                </label>
                <p className="text-xs text-text-secondary mb-2">
                  This user will be authorized to appoint staff and configure the LGU system.
                </p>
                <input
                  required
                  type="email"
                  placeholder="sysadmin@sanjuan.gov.ph"
                  value={formData.sysAdminEmail}
                  onChange={(e) => setFormData({...formData, sysAdminEmail: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-text-secondary/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground hover:bg-background rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Register Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Key Modal */}
      {newKeyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-2xl border border-primary/20 w-full max-w-md overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Registration Key</h3>
              <p className="text-text-secondary text-sm mb-6">
                You have successfully registered <strong>{newKeyModal.orgName}</strong>. 
                Please provide this Registration Key to their System Administrator for initial platform setup.
              </p>
              
              <div className="bg-background border border-text-secondary/20 rounded-xl p-4 flex items-center justify-between mb-6">
                <code className="text-sm font-mono text-foreground font-semibold tracking-wide break-all text-left">
                  {newKeyModal.regKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKeyModal.regKey)}
                  className="ml-4 p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copiedKey === newKeyModal.regKey ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                onClick={() => setNewKeyModal({ isOpen: false, orgName: "", regKey: "" })}
                className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onCancel={() => setConfirmState({ isOpen: false, idToSuspend: null })}
        onConfirm={handleSuspendConfirm}
        title="Suspend Tenant"
        message="Are you sure you want to suspend this organization? All operations and access for their users will be temporarily halted."
        confirmText="Yes, Suspend Tenant"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
