import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { Building2, Wrench, CalendarDays, Clock, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#0F8A43', '#2ECC71', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#E67E22'];

export default function Statistics() {
  const [rooms, setRooms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [r, t, res] = await Promise.all([
        ifalsi.entities.Room.list('-created_date', 100),
        ifalsi.entities.Ticket.list('-created_date', 100),
        ifalsi.entities.Reservation.list('-created_date', 100),
      ]);
      setRooms(r);
      setTickets(t);
      setReservations(res);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  const roomsByStatus = ['Disponível', 'Ocupada', 'Reservada', 'Em Manutenção'].map(s => ({
    name: s, value: rooms.filter(r => r.status === s).length
  }));

  const ticketsByCategory = {};
  tickets.forEach(t => { ticketsByCategory[t.category] = (ticketsByCategory[t.category] || 0) + 1; });
  const categoryData = Object.entries(ticketsByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  const ticketsByStatus = ['Recebido', 'Em Análise', 'Em Atendimento', 'Aguardando Peça', 'Concluído', 'Cancelado'].map(s => ({
    name: s, value: tickets.filter(t => t.status === s).length
  }));

  const openTickets = tickets.filter(t => !['Concluído', 'Cancelado'].includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => t.status === 'Concluído').length;
  const confirmedRes = reservations.filter(r => r.status === 'Confirmada').length;

  const roomsByType = {};
  rooms.forEach(r => { roomsByType[r.room_type] = (roomsByType[r.room_type] || 0) + 1; });
  const typeData = Object.entries(roomsByType).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Estatísticas</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de Salas', value: rooms.length, icon: Building2, color: 'bg-ifal-green/10 text-ifal-green' },
          { label: 'Chamados Abertos', value: openTickets, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
          { label: 'Chamados Resolvidos', value: resolvedTickets, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Reservas Ativas', value: confirmedRes, icon: CalendarDays, color: 'bg-blue-50 text-blue-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-border p-4"
          >
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Room status */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Salas por Situação</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={roomsByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {roomsByStatus.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Rooms by type */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Salas por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0F8A43" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by category */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Chamados por Categoria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#F39C12" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by status */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-heading font-semibold mb-4">Chamados por Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ticketsByStatus.filter(s => s.value > 0)} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {ticketsByStatus.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}