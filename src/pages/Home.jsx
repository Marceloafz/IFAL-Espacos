import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Wrench, CalendarDays, Megaphone, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import CampusMap from '@/components/campus/CampusMap';
import StatusBadge from '@/components/ui/StatusBadge';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, t, a] = await Promise.all([
          ifalsi.entities.Room.list('-created_date', 50),
          ifalsi.entities.Ticket.list('-created_date', 5),
          ifalsi.entities.Announcement.filter({ is_active: true }, '-created_date', 3),
        ]);
        setRooms(r);
        setTickets(t);
        setAnnouncements(a);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const availableRooms = rooms.filter(r => r.status === 'Disponível').length;
  const openTickets = tickets.filter(t => t.status !== 'Concluído' && t.status !== 'Cancelado').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
          {greeting()}, {user?.full_name?.split(' ')[0] || 'Usuário'} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          O campus está com <span className="font-semibold text-ifal-green">{availableRooms}</span> de {rooms.length} salas disponíveis agora.
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de Salas', value: rooms.length, icon: Building2, color: 'bg-ifal-green/10 text-ifal-green' },
          { label: 'Disponíveis', value: availableRooms, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Chamados Abertos', value: openTickets, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
          { label: 'Avisos Ativos', value: announcements.length, icon: Megaphone, color: 'bg-blue-50 text-blue-600' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-heading font-semibold">Mapa do Campus</h2>
          <Link to="/mapa" className="text-sm text-ifal-green font-medium flex items-center gap-1 hover:underline">
            Ver completo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <CampusMap
          rooms={rooms}
          selectedRoomId={selectedRoom?.id}
          onSelectRoom={(room) => { setSelectedRoom(room); navigate(`/salas/${room.id}`); }}
          className="h-[350px] md:h-[420px]"
        />
      </motion.div>

      {/* Quick actions + Announcements */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Reservar Sala', icon: CalendarDays, path: '/reservas', color: 'bg-ifal-green text-white' },
              { label: 'Abrir Chamado', icon: Wrench, path: '/infraestrutura/novo', color: 'bg-ifal-amber text-white' },
              { label: 'Ver Salas', icon: Building2, path: '/salas', color: 'bg-blue-500 text-white' },
              { label: 'Estatísticas', icon: TrendingUp, path: '/estatisticas', color: 'bg-purple-500 text-white' },
            ].map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center shrink-0`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Avisos Recentes</h3>
            <Link to="/avisos" className="text-sm text-ifal-green font-medium hover:underline">Ver todos</Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum aviso no momento.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-ifal-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4 text-ifal-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={a.priority} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.created_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent rooms */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold">Salas do Campus</h3>
          <Link to="/salas" className="text-sm text-ifal-green font-medium hover:underline">Ver todas</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.slice(0, 6).map((room) => (
            <Link
              key={room.id}
              to={`/salas/${room.id}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-ifal-green/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-ifal-green" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{room.name}</p>
                <p className="text-xs text-muted-foreground">{room.block} · {room.capacity} pessoas</p>
                <StatusBadge status={room.status} className="mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}