import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useAuth } from '@/lib/AuthContext';
import { User, Mail, Building2, Wrench, CalendarDays, LogOut, Settings, Star, Clock } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, r] = await Promise.all([
          ifalsi.entities.Ticket.list('-created_date', 20),
          ifalsi.entities.Reservation.list('-created_date', 20),
        ]);
        setTickets(t);
        setReservations(r);
      } catch(e) {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-border p-6 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-ifal-green/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-ifal-green" />
        </div>
        <h2 className="text-xl font-heading font-bold">{user?.full_name || 'Usuário'}</h2>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
          <Mail className="w-3.5 h-3.5" /> {user?.email || ''}
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold">{tickets.length}</p>
            <p className="text-xs text-muted-foreground">Chamados</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold">{reservations.length}</p>
            <p className="text-xs text-muted-foreground">Reservas</p>
          </div>
        </div>
      </motion.div>

      {/* History */}
      <Tabs defaultValue="tickets">
        <TabsList className="w-full">
          <TabsTrigger value="tickets" className="flex-1">Chamados</TabsTrigger>
          <TabsTrigger value="reservations" className="flex-1">Reservas</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum chamado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map(t => (
                <Link key={t.id} to={`/infraestrutura/${t.id}`} className="block bg-white rounded-xl border border-border p-3 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.category} - {t.room_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(t.created_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reservations" className="mt-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma reserva.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reservations.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.room_name} · {r.date ? new Date(r.date + 'T12:00').toLocaleDateString('pt-BR') : ''} · {r.start_time}-{r.end_time}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="space-y-2">
        <Link to="/configuracoes" className="flex items-center gap-3 bg-white rounded-xl border border-border p-3 hover:shadow-sm transition-all">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Configurações</span>
        </Link>
        <button
          onClick={() => ifalsi.auth.logout('/')}
          className="w-full flex items-center gap-3 bg-white rounded-xl border border-border p-3 hover:shadow-sm transition-all text-red-500"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}