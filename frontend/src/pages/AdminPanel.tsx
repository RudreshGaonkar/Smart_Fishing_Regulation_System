import React, { useState, useEffect } from 'react';
import { RiskBadge } from '../components/RiskBadge';
import { Settings, Edit2, CheckCircle, ShieldAlert, Plus, X, Loader2 } from 'lucide-react';
import {
  fetchZones, fetchAlerts, fetchSpecies, fetchPorts,
  createZone, createSpecies, resolveAlert, updateCatchLimit,
  createPort, updatePort, deletePort
} from '../services/dataService';
import type { CreateZonePayload, CreateSpeciesPayload, UpdateCatchLimitPayload, Port, CreatePortPayload } from '../services/dataService';
import { ZoneCreationMap } from '../components/ZoneCreationMap';
import type { FishingZone } from '../types/zone.types';
import type { FishSpecies } from '../types/fish.types';
import type { RiskAlert } from '../types/alert.types';

// ── Modal components ──────────────────────────────────────────────────────────

const ModalWrap: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="clay-card p-8 w-full max-w-md mx-4 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
        <X size={22} />
      </button>
      <h3 className="text-xl font-extrabold text-ocean-900 mb-6">{title}</h3>
      {children}
    </div>
  </div>
);

const inputCls = "w-full h-12 bg-transparent border-none outline-none px-4 text-slate-700 font-medium placeholder:text-slate-400";

// ── Main Component ────────────────────────────────────────────────────────────

export const AdminPanel: React.FC = () => {
  const [zones, setZones] = useState<FishingZone[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Modal states
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPortModal, setShowPortModal] = useState(false);

  // Form states
  const [zoneForm, setZoneForm] = useState<Partial<CreateZonePayload>>({ zone_type: 'open', water_type: 'ocean' });
  const [speciesForm, setSpeciesForm] = useState<Partial<CreateSpeciesPayload>>({ risk_level: 0, is_protected: false });
  const [limitForm, setLimitForm] = useState<Partial<UpdateCatchLimitPayload>>({ user_role: 'all', max_per_day: 10, effective_from: new Date().toISOString().split('T')[0] });
  const [portForm, setPortForm] = useState<Partial<CreatePortPayload>>({ latitude: 15.49, longitude: 73.82 });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchZones(), fetchAlerts(), fetchSpecies(), fetchPorts()])
      .then(([z, a, s, p]) => { setZones(z); setAlerts(a); setSpecies(s); setPorts(p); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    let nearestPort: Port | null = null;
    let minDistance = Infinity;
    
    ports.forEach(port => {
      const dist = calculateDistance(lat, lng, port.latitude, port.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPort = port;
      }
    });

    setZoneForm(prev => {
      let newName = prev.zone_name || address || 'New Zone';
      
      // Override 'New Zone' if we successfully geocoded a real name context
      if (prev.zone_name === 'New Zone' && address) {
        newName = address;
      }

      // If we are extremely close to a port, prefix the port name
      if (nearestPort && minDistance < 50) {
        const prefix = nearestPort.name.split(' ')[0];
        if (!newName.startsWith(prefix)) {
          newName = `${prefix} - ${newName.replace(/^(.*? - )/, '')}`;
        }
      }

      return { 
        ...prev, 
        latitude: Number(lat.toFixed(6)), 
        longitude: Number(lng.toFixed(6)),
        port_id: nearestPort ? nearestPort.port_id : undefined,
        zone_name: newName
      };
    });
  };

  const pendingAlerts = alerts.filter((a) => !a.is_resolved);

  const handleResolve = async (alertId: number) => {
    setResolvingId(alertId);
    try {
      await resolveAlert(alertId);
      setAlerts((prev) => prev.map((a) => a.alert_id === alertId ? { ...a, is_resolved: true } : a));
    } catch { /* silently fail; alert stays in list */ }
    finally { setResolvingId(null); }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError(null);
    try {
      const created = await createZone(zoneForm as CreateZonePayload);
      setZones((prev) => [...prev, created]);
      setShowZoneModal(false);
      setZoneForm({ zone_type: 'open', water_type: 'ocean' });
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create zone');
    } finally { setFormLoading(false); }
  };

  const handleCreateSpecies = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError(null);
    try {
      const created = await createSpecies(speciesForm as CreateSpeciesPayload);
      setSpecies((prev) => [...prev, created]);

      // Sequential await — ensure alert feed reflects any baseline risk alerts
      // generated server-side before closing the modal
      const freshAlerts = await fetchAlerts();
      setAlerts(freshAlerts);

      setShowSpeciesModal(false);
      setSpeciesForm({ risk_level: 0, is_protected: false });
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create species');
    } finally { setFormLoading(false); }
  };

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError(null);
    try {
      await updateCatchLimit(limitForm as UpdateCatchLimitPayload);
      setShowLimitModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to update limit');
    } finally { setFormLoading(false); }
  };

  const handleCreatePort = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError(null);
    try {
      const created = await createPort(portForm as CreatePortPayload);
      setPorts((prev) => [...prev, created]);
      setShowPortModal(false);
      setPortForm({ latitude: 15.49, longitude: 73.82 });
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create port');
    } finally { setFormLoading(false); }
  };

  const handleDeletePort = async (portId: number) => {
    try {
      await deletePort(portId);
      setPorts((prev) => prev.filter((p) => p.port_id !== portId));
    } catch (err: any) {
      alert("Failed to delete port: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 clay-inset rounded-2xl flex items-center justify-center text-ocean-600 bg-white/40">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Administrator Panel</h2>
            <p className="text-slate-500 font-medium mt-1">Manage zones, species, limits and resolve alerts.</p>
          </div>
        </div>
        <button className="clay-button px-5 py-3 shadow-sm rounded-xl text-ocean-800 hover:text-ocean-900 font-bold flex items-center gap-2">
          <Settings size={20} /><span>System Settings</span>
        </button>
      </div>

      {isLoading && <div className="text-slate-500 font-medium italic px-1">Loading...</div>}

      {/* Action Buttons */}
      {!isLoading && (
        <div className="flex flex-wrap gap-3 px-1">
          <button onClick={() => { setShowZoneModal(true); setFormError(null); }}
            className="clay-button px-5 py-3 rounded-xl bg-ocean-500 text-white border-ocean-400 font-bold flex items-center gap-2 hover:bg-ocean-600">
            <Plus size={18} /> Add Zone
          </button>
          <button onClick={() => { setShowSpeciesModal(true); setFormError(null); }}
            className="clay-button px-5 py-3 rounded-xl bg-teal-500 text-white border-teal-400 font-bold flex items-center gap-2 hover:bg-teal-600">
            <Plus size={18} /> Add Species
          </button>
          <button onClick={() => { setShowPortModal(true); setFormError(null); }}
            className="clay-button px-5 py-3 rounded-xl bg-emerald-500 text-white border-emerald-400 font-bold flex items-center gap-2 hover:bg-emerald-600">
            <Plus size={18} /> Add Port
          </button>
          <button onClick={() => { setShowLimitModal(true); setFormError(null); }}
            className="clay-button px-5 py-3 rounded-xl bg-amber-500 text-white border-amber-400 font-bold flex items-center gap-2 hover:bg-amber-600">
            <Edit2 size={18} /> Set Catch Limit
          </button>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
          {/* Alerts Section */}
          <div className="clay-card p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="text-xl font-extrabold text-ocean-900">Action Required</h3>
              <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs shadow-inner">
                {pendingAlerts.length} Pending
              </span>
            </div>
            <div className="flex flex-col gap-5 flex-1">
              {pendingAlerts.map((alert) => (
                <div key={alert.alert_id} className="clay-inset p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1"><RiskBadge status={alert.severity as any} /></div>
                    <div>
                      <p className="font-bold text-ocean-900 leading-tight">{alert.message}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolve(alert.alert_id)}
                    disabled={resolvingId === alert.alert_id}
                    className="clay-button bg-ocean-500 text-white hover:bg-ocean-600 px-5 py-2 text-sm rounded-xl font-bold border-none h-auto flex-shrink-0 flex items-center gap-2 disabled:opacity-60"
                  >
                    {resolvingId === alert.alert_id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Resolve
                  </button>
                </div>
              ))}
              {pendingAlerts.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-medium italic clay-inset rounded-2xl flex-1 flex items-center justify-center">
                  No pending alerts — all clear!
                </div>
              )}
            </div>
          </div>

          {/* Zones List */}
          <div className="clay-card p-8 flex flex-col h-full">
            <h3 className="text-xl font-extrabold text-ocean-900 mb-6 px-1">
              Fishing Zones <span className="text-ocean-400 font-bold text-base ml-2">({zones.length})</span>
            </h3>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-[400px] pr-1">
              {zones.map((zone) => (
                <div key={zone.zone_id} className="clay-inset p-4 rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-extrabold text-ocean-900 leading-tight">{zone.zone_name}</h4>
                    <p className="text-xs font-semibold text-ocean-700/70 mt-1 uppercase tracking-wide">
                      {zone.zone_code} · {zone.zone_type}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    zone.zone_type === 'open' ? 'bg-green-100 text-green-700' :
                    zone.zone_type === 'closed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{zone.zone_type}</span>
                </div>
              ))}
              {zones.length === 0 && <p className="text-slate-400 italic text-center py-8">No zones found</p>}
            </div>
          </div>

          {/* Ports List */}
          <div className="clay-card p-8 flex flex-col h-full col-span-full lg:col-span-1">
            <h3 className="text-xl font-extrabold text-ocean-900 mb-6 px-1">
              Registered Ports <span className="text-ocean-400 font-bold text-base ml-2">({ports.length})</span>
            </h3>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-[400px] pr-1">
              {ports.map((port) => (
                <div key={port.port_id} className="clay-inset p-4 rounded-2xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-extrabold text-ocean-900 leading-tight">{port.name}</h4>
                    <p className="text-xs font-semibold text-ocean-700/70 mt-1">
                      {Number(port.latitude).toFixed(4)}, {Number(port.longitude).toFixed(4)}
                    </p>
                  </div>
                  <button onClick={() => handleDeletePort(port.port_id)} className="text-red-500 hover:text-red-600 bg-red-100/50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {ports.length === 0 && <p className="text-slate-400 italic text-center py-8">No ports found</p>}
            </div>
          </div>

          {/* Species List */}
          <div className="clay-card p-8 flex flex-col col-span-full">
            <h3 className="text-xl font-extrabold text-ocean-900 mb-6 px-1">
              Fish Species <span className="text-ocean-400 font-bold text-base ml-2">({species.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {species.map((s) => (
                <div key={s.species_id} className="clay-inset p-4 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-ocean-900 leading-tight">{s.common_name}</h4>
                    {s.is_protected && (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">Protected</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 italic mt-1">{s.scientific_name}</p>
                  <div className="mt-3 flex gap-4 text-xs font-semibold text-ocean-700">
                    <span>Risk: {s.risk_level}/5</span>
                    {s.daily_catch_limit && <span>Limit: {s.daily_catch_limit}/day</span>}
                  </div>
                </div>
              ))}
              {species.length === 0 && <p className="text-slate-400 italic text-center py-8 col-span-full">No species found</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}

      {showZoneModal && (
        <ModalWrap title="Add New Fishing Zone" onClose={() => setShowZoneModal(false)}>
          <div className="max-h-[85vh] overflow-y-auto pr-2 -mr-2">
            <form onSubmit={handleCreateZone} className="flex flex-col gap-4 pb-4">
              {formError && <p className="text-red-500 text-sm font-semibold">{formError}</p>}
              
              <ZoneCreationMap 
                onLocationSelect={handleLocationSelect} 
                lat={zoneForm.latitude} 
                lng={zoneForm.longitude} 
                existingZones={zones} 
              />

              {[
                { label: 'Zone Name', key: 'zone_name', type: 'text', placeholder: 'e.g. Coastal Alpha' },
                { label: 'Zone Code', key: 'zone_code', type: 'text', placeholder: 'e.g. CA-01' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">{label}</label>
                  <div className="clay-inset rounded-xl">
                    <input required type={type} placeholder={placeholder} className={inputCls} value={(zoneForm as any)[key] || ''}
                      onChange={(e) => setZoneForm((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                </div>
              ))}
              
              <div className="flex gap-4">
                {[
                  { label: 'Latitude', key: 'latitude', type: 'number', placeholder: '15.49' },
                  { label: 'Longitude', key: 'longitude', type: 'number', placeholder: '73.82' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">{label}</label>
                    <div className="clay-inset rounded-xl">
                      <input required type={type} step="any" placeholder={placeholder} className={inputCls} value={(zoneForm as any)[key] || ''}
                        onChange={(e) => setZoneForm((p) => ({ ...p, [key]: parseFloat(e.target.value) }))} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Zone Type</label>
                  <div className="clay-inset rounded-xl">
                    <select className={inputCls} value={zoneForm.zone_type}
                      onChange={(e) => setZoneForm((p) => ({ ...p, zone_type: e.target.value as any }))}>
                      {['open', 'restricted', 'protected', 'closed'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Water Type</label>
                  <div className="clay-inset rounded-xl">
                    <select className={inputCls} value={zoneForm.water_type}
                      onChange={(e) => setZoneForm((p) => ({ ...p, water_type: e.target.value as any }))}>
                      {['ocean', 'river', 'estuary', 'backwater'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Nearest Port</label>
                <div className="clay-inset rounded-xl">
                  <select className={inputCls} value={zoneForm.port_id || ''}
                    onChange={(e) => setZoneForm((p) => ({ ...p, port_id: e.target.value ? parseInt(e.target.value) : undefined }))}>
                    <option value="">None / Unknown</option>
                    {ports.map((p) => <option key={p.port_id} value={p.port_id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={formLoading}
                className="clay-button h-12 mt-2 bg-ocean-500 text-white border-ocean-400 font-bold hover:bg-ocean-600 flex items-center justify-center gap-2 disabled:opacity-60">
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Zone
              </button>
            </form>
          </div>
        </ModalWrap>
      )}

      {showSpeciesModal && (
        <ModalWrap title="Add New Fish Species" onClose={() => setShowSpeciesModal(false)}>
          <form onSubmit={handleCreateSpecies} className="flex flex-col gap-4">
            {formError && <p className="text-red-500 text-sm font-semibold">{formError}</p>}
            {[
              { label: 'Common Name', key: 'common_name', placeholder: 'e.g. Yellowfin Tuna' },
              { label: 'Scientific Name', key: 'scientific_name', placeholder: 'e.g. Thunnus albacares' },
              { label: 'Daily Catch Limit', key: 'daily_catch_limit', placeholder: '10' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">{label}</label>
                <div className="clay-inset rounded-xl">
                  <input required={key !== 'daily_catch_limit'} type={key === 'daily_catch_limit' ? 'number' : 'text'} placeholder={placeholder} className={inputCls}
                    onChange={(e) => setSpeciesForm((p) => ({ ...p, [key]: key === 'daily_catch_limit' ? parseInt(e.target.value) : e.target.value }))} />
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Risk Level (0-5)</label>
              <div className="clay-inset rounded-xl">
                <input type="number" min={0} max={5} className={inputCls} value={speciesForm.risk_level}
                  onChange={(e) => setSpeciesForm((p) => ({ ...p, risk_level: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Seed in Zone (optional)</label>
                <div className="clay-inset rounded-xl">
                  <select className={inputCls} value={speciesForm.zone_id || ''}
                    onChange={(e) => setSpeciesForm((p) => ({ ...p, zone_id: e.target.value ? parseInt(e.target.value) : undefined }))}>
                    <option value="">None</option>
                    {zones.map((z) => <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Initial Stock</label>
                <div className="clay-inset rounded-xl">
                  <input type="number" min={0} className={inputCls} placeholder="e.g. 5000" disabled={!speciesForm.zone_id}
                    onChange={(e) => setSpeciesForm((p) => ({ ...p, initial_stock: parseInt(e.target.value) }))} />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-bold text-ocean-800 cursor-pointer ml-1 mt-2">
              <input type="checkbox" checked={speciesForm.is_protected}
                onChange={(e) => setSpeciesForm((p) => ({ ...p, is_protected: e.target.checked }))} className="w-4 h-4 accent-ocean-500" />
              Mark as Protected Species
            </label>
            <button type="submit" disabled={formLoading}
              className="clay-button h-12 mt-2 bg-teal-500 text-white border-teal-400 font-bold hover:bg-teal-600 flex items-center justify-center gap-2 disabled:opacity-60">
              {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Species
            </button>
          </form>
        </ModalWrap>
      )}

      {showLimitModal && (
        <ModalWrap title="Set Catch Limit" onClose={() => setShowLimitModal(false)}>
          <form onSubmit={handleUpdateLimit} className="flex flex-col gap-4">
            {formError && <p className="text-red-500 text-sm font-semibold">{formError}</p>}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Zone (optional)</label>
              <div className="clay-inset rounded-xl">
                <select className={inputCls} onChange={(e) => setLimitForm((p) => ({ ...p, zone_id: e.target.value ? parseInt(e.target.value) : undefined }))}>
                  <option value="">All Zones</option>
                  {zones.map((z) => <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Species (optional)</label>
              <div className="clay-inset rounded-xl">
                <select className={inputCls} onChange={(e) => setLimitForm((p) => ({ ...p, species_id: e.target.value ? parseInt(e.target.value) : undefined }))}>
                  <option value="">All Species</option>
                  {species.map((s) => <option key={s.species_id} value={s.species_id}>{s.common_name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Role</label>
              <div className="clay-inset rounded-xl">
                <select className={inputCls} value={limitForm.user_role} onChange={(e) => setLimitForm((p) => ({ ...p, user_role: e.target.value as any }))}>
                  {['all', 'fisherman', 'researcher'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              {[
                { label: 'Max Per Day', key: 'max_per_day' },
                { label: 'Max Per Trip', key: 'max_per_trip' },
              ].map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">{label}</label>
                  <div className="clay-inset rounded-xl">
                    <input type="number" min={1} className={inputCls} placeholder="e.g. 10"
                      onChange={(e) => setLimitForm((p) => ({ ...p, [key]: parseInt(e.target.value) }))} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Effective From</label>
              <div className="clay-inset rounded-xl">
                <input type="date" className={inputCls} value={limitForm.effective_from}
                  onChange={(e) => setLimitForm((p) => ({ ...p, effective_from: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={formLoading}
              className="clay-button h-12 mt-2 bg-amber-500 text-white border-amber-400 font-bold hover:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-60">
              {formLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Apply Limit
            </button>
          </form>
        </ModalWrap>
      )}

      {showPortModal && (
        <ModalWrap title="Add Departure Port" onClose={() => setShowPortModal(false)}>
          <div className="max-h-[85vh] overflow-y-auto pr-2 -mr-2">
            <form onSubmit={handleCreatePort} className="flex flex-col gap-4 pb-4">
              {formError && <p className="text-red-500 text-sm font-semibold">{formError}</p>}
              
              <ZoneCreationMap 
                onLocationSelect={(lat, lng, address) => {
                  setPortForm(p => ({
                    ...p,
                    latitude: Number(lat.toFixed(6)),
                    longitude: Number(lng.toFixed(6)),
                    name: (p.name && p.name.length > 0) ? p.name : address || ''
                  }));
                }} 
                lat={portForm.latitude} 
                lng={portForm.longitude} 
                existingZones={[]} 
              />

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">Port Name</label>
                <div className="clay-inset rounded-xl">
                  <input required type="text" placeholder="e.g. Panaji Harbor" className={inputCls} value={portForm.name || ''}
                    onChange={(e) => setPortForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
              </div>
              
              <div className="flex gap-4">
                {[
                  { label: 'Latitude', key: 'latitude', type: 'number', placeholder: '15.49' },
                  { label: 'Longitude', key: 'longitude', type: 'number', placeholder: '73.82' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-bold text-ocean-800 uppercase tracking-wide ml-1">{label}</label>
                    <div className="clay-inset rounded-xl">
                      <input required type={type} step="any" placeholder={placeholder} className={inputCls} value={(portForm as any)[key] || ''}
                        onChange={(e) => setPortForm((p) => ({ ...p, [key]: parseFloat(e.target.value) }))} />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={formLoading}
                className="clay-button h-12 mt-2 bg-emerald-500 text-white border-emerald-400 font-bold hover:bg-emerald-600 flex items-center justify-center gap-2 disabled:opacity-60">
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Register Port
              </button>
            </form>
          </div>
        </ModalWrap>
      )}
    </div>
  );
};
