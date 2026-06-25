import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { Link } from 'react-router-dom';
import { Wrench, Plus, Search, Filter, Clock, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { motion } from 'framer-motion';

const CATEGORIES = ['Ar Condicionado', 'Projetor', 'Computadores', 'Internet', 'Energia', 'Iluminação', 'Banheiro', 'Limpeza', 'Mobiliário', 'Portas', 'Janelas', 'Telhado', 'Infiltração', 'Segurança', 'Acessibilidade', 'Outros'];

const categoryIcons = {
  'Ar Condicionado': '❄️', 'Projetor': '📽️', 'Computadores': '💻', 'Internet': '🌐',
  'Energia': '⚡', 'Iluminação': '💡', 'Banheiro': '🚻', 'Limpeza': '🧹',
  'Mobiliário': '🪑', 'Portas': '🚪', 'Janelas': '🪟', 'Telhado': '🏠',
  'Infiltração': '💧', 'Segurança': '🔒', 'Acessibilidade': '♿', 'Outros': '📋',
};

export default function Infrastructure() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    ifalsi.entities.Ticket.list('-created_date', 50).then(t => { setTickets(t); setLoading(false); });
  }, []);

  const filtered = tickets.filter(t => {
    if (search && !t.protocol?.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase()) && !t.room_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Infraestrutura</h1>
        <Link to="/infraestrutura/novo" className="flex items-center gap-2 px-4 py-2.5 bg-ifal-green text-white rounded-xl text-sm font-medium hover:bg-ifal-green-dark transition-colors">
          <Plus className="w-4 h-4" /> Abrir Chamado
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar chamado..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {['Recebido', 'Em Análise', 'Em Atendimento', 'Aguardando Peça', 'Concluído', 'Cancelado'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum chamado encontrado.</p>
          <Link to="/infraestrutura/novo" className="text-sm text-ifal-green font-medium hover:underline mt-2 inline-block">Abrir um novo chamado</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Link to={`/infraestrutura/${ticket.id}`} className="block bg-white rounded-2xl border border-border p-4 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
                      {categoryIcons[ticket.category] || '📋'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.protocol || `#${ticket.id?.slice(-6)}`}</span>
                        <StatusBadge status={ticket.priority} />
                      </div>
                      <p className="text-sm font-medium mt-1 line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{ticket.room_name}</span>
                        <span>{ticket.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}