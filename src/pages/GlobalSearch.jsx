import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Building2, Wrench, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/ui/StatusBadge';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [rooms, setRooms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) { setRooms([]); setTickets([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      const [r, t] = await Promise.all([
        ifalsi.entities.Room.list('-created_date', 100),
        ifalsi.entities.Ticket.list('-created_date', 50),
      ]);
      const q = query.toLowerCase();
      setRooms(r.filter(room => room.name?.toLowerCase().includes(q) || room.room_id?.toLowerCase().includes(q) || room.block?.toLowerCase().includes(q) || room.room_type?.toLowerCase().includes(q)));
      setTickets(t.filter(ticket => ticket.protocol?.toLowerCase().includes(q) || ticket.description?.toLowerCase().includes(q) || ticket.room_name?.toLowerCase().includes(q)));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar sala, laboratório, bloco, equipamento..."
            className="pl-11 h-12 text-base"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-3 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
        </div>
      )}

      {!loading && query && rooms.length === 0 && tickets.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground">Nenhum resultado para "{query}"</p>
        </div>
      )}

      {rooms.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Salas ({rooms.length})</h3>
          <div className="space-y-1">
            {rooms.map(room => (
              <Link key={room.id} to={`/salas/${room.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors">
                <div className="w-9 h-9 rounded-lg bg-ifal-green/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-ifal-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                  <p className="text-xs text-muted-foreground">{room.room_id} · {room.block} · {room.room_type}</p>
                </div>
                <StatusBadge status={room.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {tickets.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Chamados ({tickets.length})</h3>
          <div className="space-y-1">
            {tickets.map(t => (
              <Link key={t.id} to={`/infraestrutura/${t.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.protocol || `#${t.id?.slice(-6)}`}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}