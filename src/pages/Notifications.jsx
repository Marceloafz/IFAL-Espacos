import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle2, Wrench, CalendarDays, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Notifications() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, a] = await Promise.all([
        ifalsi.entities.Ticket.list('-created_date', 10),
        ifalsi.entities.Announcement.filter({ is_active: true }, '-created_date', 10),
      ]);
      setTickets(t);
      setAnnouncements(a);
      setLoading(false);
    };
    load();
  }, []);

  const notifications = [
    ...tickets.map(t => ({
      id: t.id,
      type: 'ticket',
      title: `Chamado ${t.protocol || ''}`,
      message: `${t.category} - ${t.status}`,
      date: t.updated_date || t.created_date,
      icon: Wrench,
      color: 'bg-amber-50 text-amber-600',
    })),
    ...announcements.map(a => ({
      id: a.id,
      type: 'announcement',
      title: a.title,
      message: a.content?.slice(0, 80) + '...',
      date: a.created_date,
      icon: Megaphone,
      color: 'bg-blue-50 text-blue-600',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-bold">Notificações</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma notificação.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-white rounded-xl border border-border p-3 flex items-start gap-3"
            >
              <div className={`w-9 h-9 rounded-lg ${n.color} flex items-center justify-center shrink-0`}>
                <n.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}