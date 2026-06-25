import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { Link } from 'react-router-dom';
import { Building2, Search, Filter, Users, Projector, Monitor, Wind, Wifi, Accessibility, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { motion } from 'framer-motion';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [equipFilter, setEquipFilter] = useState({
    projector: false, computers: false, ac: false, internet: false, accessibility: false
  });

  useEffect(() => {
    ifalsi.entities.Room.list('-created_date', 100).then(r => { setRooms(r); setLoading(false); });
  }, []);

  const filtered = rooms.filter(r => {
    if (search && !r.name?.toLowerCase().includes(search.toLowerCase()) && !r.room_id?.toLowerCase().includes(search.toLowerCase())) return false;
    if (blockFilter !== 'all' && r.block !== blockFilter) return false;
    if (typeFilter !== 'all' && r.room_type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (equipFilter.projector && !r.has_projector) return false;
    if (equipFilter.computers && !r.has_computers) return false;
    if (equipFilter.ac && !r.has_ac) return false;
    if (equipFilter.internet && !r.has_internet) return false;
    if (equipFilter.accessibility && !r.has_accessibility) return false;
    return true;
  });

  const activeFilters = Object.values(equipFilter).filter(Boolean).length + (blockFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Salas</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} de {rooms.length}</span>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou ID..." className="pl-9" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            activeFilters > 0 ? 'bg-ifal-green text-white border-ifal-green' : 'bg-white border-border hover:bg-secondary'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilters > 0 && <span className="w-5 h-5 rounded-full bg-white text-ifal-green text-xs flex items-center justify-center font-bold">{activeFilters}</span>}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white rounded-2xl border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filtros</h3>
            <button onClick={() => { setBlockFilter('all'); setTypeFilter('all'); setStatusFilter('all'); setEquipFilter({ projector: false, computers: false, ac: false, internet: false, accessibility: false }); }} className="text-xs text-ifal-green font-medium">Limpar todos</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={blockFilter} onValueChange={setBlockFilter}>
              <SelectTrigger><SelectValue placeholder="Bloco" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Blocos</SelectItem>
                {['Bloco A', 'Bloco B', 'Bloco C', 'Bloco D', 'Bloco E', 'Administrativo'].map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {['Sala de Aula', 'Laboratório', 'Auditório', 'Sala de Reunião', 'Biblioteca'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Situação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Situações</SelectItem>
                {['Disponível', 'Ocupada', 'Reservada', 'Em Manutenção'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'projector', label: 'Projetor', icon: Projector },
              { key: 'computers', label: 'Computadores', icon: Monitor },
              { key: 'ac', label: 'Ar Condicionado', icon: Wind },
              { key: 'internet', label: 'Internet', icon: Wifi },
              { key: 'accessibility', label: 'Acessibilidade', icon: Accessibility },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setEquipFilter(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  equipFilter[f.key] ? 'bg-ifal-green text-white border-ifal-green' : 'bg-white border-border hover:bg-secondary text-muted-foreground'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rooms grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma sala encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((room, i) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Link to={`/salas/${room.id}`} className="block bg-white rounded-2xl border border-border p-4 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-ifal-green/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-ifal-green" />
                  </div>
                  <StatusBadge status={room.status} />
                </div>
                <h3 className="font-semibold text-sm group-hover:text-ifal-green transition-colors">{room.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{room.room_id} · {room.block} · {room.room_type}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room.capacity}</span>
                  {room.has_projector && <Projector className="w-3.5 h-3.5 text-ifal-green" title="Projetor" />}
                  {room.has_computers && <Monitor className="w-3.5 h-3.5 text-blue-500" title="Computadores" />}
                  {room.has_ac && <Wind className="w-3.5 h-3.5 text-cyan-500" title="Ar Condicionado" />}
                  {room.has_internet && <Wifi className="w-3.5 h-3.5 text-purple-500" title="Internet" />}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}