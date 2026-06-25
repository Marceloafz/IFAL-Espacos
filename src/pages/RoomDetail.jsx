import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Users, MapPin, Monitor, Projector, Tv, Wind, Wifi, Accessibility, PlugZap, Wrench, CalendarDays, Share2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { motion } from 'framer-motion';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await ifalsi.entities.Room.get(id);
        setRoom(r);
        const res = await ifalsi.entities.Reservation.filter({ room_id: r.room_id, status: 'Confirmada' }, '-date', 20);
        setReservations(res);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Building2 className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Sala não encontrada</p>
        <Link to="/salas" className="text-sm text-ifal-green font-medium hover:underline">Voltar às salas</Link>
      </div>
    );
  }

  const equipment = [
    { label: 'Projetor', has: room.has_projector, icon: Projector },
    { label: 'TV', has: room.has_tv, icon: Tv },
    { label: 'Computadores', has: room.has_computers, icon: Monitor, detail: room.computer_count ? `${room.computer_count} unidades` : null },
    { label: 'Ar Condicionado', has: room.has_ac, icon: Wind },
    { label: 'Internet', has: room.has_internet, icon: Wifi },
    { label: 'Acessibilidade', has: room.has_accessibility, icon: Accessibility },
    { label: 'Quadro', has: room.has_whiteboard, icon: Building2 },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-heading font-bold">{room.name}</h1>
          <p className="text-sm text-muted-foreground">{room.room_id} · {room.block}</p>
        </div>
        <StatusBadge status={room.status} />
      </div>

      {/* Photo placeholder */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-ifal-green/10 to-ifal-green/5 rounded-2xl h-48 md:h-64 flex items-center justify-center border border-ifal-green/10">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-ifal-green/30 mx-auto mb-2" />
          <p className="text-sm text-ifal-green/50">{room.room_type}</p>
        </div>
      </motion.div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Capacidade', value: `${room.capacity} pessoas`, icon: Users },
          { label: 'Tipo', value: room.room_type, icon: Building2 },
          { label: 'Área', value: room.area_m2 ? `${room.area_m2}m²` : 'N/A', icon: MapPin },
          { label: 'Tomadas', value: room.outlet_count || 0, icon: PlugZap },
        ].map((info, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-3">
            <info.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-lg font-bold">{info.value}</p>
            <p className="text-xs text-muted-foreground">{info.label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {room.description && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-2">Descrição</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{room.description}</p>
        </div>
      )}

      {/* Equipment */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-3">Equipamentos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {equipment.map((eq, i) => (
            <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl border ${eq.has ? 'border-ifal-green/20 bg-ifal-green/5' : 'border-border bg-gray-50 opacity-50'}`}>
              <eq.icon className={`w-4 h-4 ${eq.has ? 'text-ifal-green' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">{eq.label}</p>
                {eq.detail && <p className="text-xs text-muted-foreground">{eq.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-3">Agenda Semanal</h3>
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="grid grid-cols-8 gap-px min-w-[600px] bg-border rounded-xl overflow-hidden">
            <div className="bg-secondary p-2 text-xs font-medium text-muted-foreground" />
            {DAYS.map(d => (
              <div key={d} className="bg-secondary p-2 text-xs font-medium text-center">{d}</div>
            ))}
            {HOURS.slice(0, 8).map(h => (
              <React.Fragment key={h}>
                <div className="bg-white p-2 text-xs text-muted-foreground">{h}</div>
                {DAYS.map(d => {
                  const hasRes = reservations.some(r => r.start_time === h);
                  return (
                    <div key={`${d}-${h}`} className={`p-2 text-center text-xs ${hasRes ? 'bg-ifal-green/10 text-ifal-green font-medium' : 'bg-white text-muted-foreground'}`}>
                      {hasRes ? '●' : '–'}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Responsible */}
      {room.responsible && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-2">Responsável</h3>
          <p className="text-sm text-muted-foreground">{room.responsible}</p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4">
        <Link to={`/reservas?room=${room.room_id}`} className="flex items-center justify-center gap-2 py-3 bg-ifal-green text-white rounded-xl font-medium text-sm hover:bg-ifal-green-dark transition-colors">
          <CalendarDays className="w-4 h-4" /> Reservar Sala
        </Link>
        <Link to={`/infraestrutura/novo?room=${room.room_id}&room_name=${encodeURIComponent(room.name)}`} className="flex items-center justify-center gap-2 py-3 bg-ifal-amber text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
          <Wrench className="w-4 h-4" /> Solicitar Manutenção
        </Link>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="flex items-center justify-center gap-2 py-3 bg-white border border-border text-foreground rounded-xl font-medium text-sm hover:bg-secondary transition-colors"
        >
          <Share2 className="w-4 h-4" /> Compartilhar
        </button>
      </div>
    </div>
  );
}