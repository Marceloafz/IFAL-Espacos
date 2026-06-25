import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Clock, MapPin, Send, Star } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const TIMELINE_STATUSES = ['Recebido', 'Em Análise', 'Em Atendimento', 'Aguardando Peça', 'Concluído'];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const t = await ifalsi.entities.Ticket.get(id);
        setTicket(t);
        const c = await ifalsi.entities.TicketComment.filter({ ticket_id: id }, 'created_date', 50);
        setComments(c);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  const sendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const c = await ifalsi.entities.TicketComment.create({
        ticket_id: id,
        author_name: user?.full_name || 'Usuário',
        content: newComment,
      });
      setComments(prev => [...prev, c]);
      setNewComment('');
    } catch(e) {
      toast({ title: 'Erro', description: 'Não foi possível enviar o comentário.', variant: 'destructive' });
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-muted-foreground">Chamado não encontrado</p>
      </div>
    );
  }

  const currentIdx = TIMELINE_STATUSES.indexOf(ticket.status);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">{ticket.protocol || `#${ticket.id?.slice(-6)}`}</span>
            <StatusBadge status={ticket.priority} />
          </div>
          <h1 className="text-lg font-heading font-bold mt-0.5">{ticket.category}</h1>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Local</p>
            <p className="font-medium">{ticket.room_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Data</p>
            <p className="font-medium">{new Date(ticket.created_date).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Solicitante</p>
            <p className="font-medium">{ticket.requester_name}</p>
          </div>
          {ticket.assigned_to && (
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Responsável</p>
              <p className="font-medium">{ticket.assigned_to}</p>
            </div>
          )}
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Descrição</p>
          <p className="text-sm leading-relaxed">{ticket.description}</p>
        </div>
        {ticket.photos?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {ticket.photos.map((p, i) => (
              <img key={i} src={p} alt="" className="w-20 h-20 rounded-xl object-cover border border-border" />
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-4">Linha do Tempo</h3>
        <div className="flex items-center gap-0">
          {TIMELINE_STATUSES.map((s, i) => {
            const reached = ticket.status === 'Cancelado' ? false : i <= currentIdx;
            const isCurrent = s === ticket.status;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    reached ? 'bg-ifal-green border-ifal-green text-white' : 'bg-white border-border text-muted-foreground'
                  } ${isCurrent ? 'ring-4 ring-ifal-green/20' : ''}`}>
                    {i + 1}
                  </div>
                  <p className={`text-[10px] mt-1.5 text-center leading-tight ${reached ? 'text-ifal-green font-medium' : 'text-muted-foreground'}`}>{s}</p>
                </div>
                {i < TIMELINE_STATUSES.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-4 ${reached && i < currentIdx ? 'bg-ifal-green' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-heading font-semibold mb-4">Comentários</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
        ) : (
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-ifal-green/10 flex items-center justify-center text-xs font-bold text-ifal-green shrink-0">
                  {c.author_name?.charAt(0)}
                </div>
                <div className="flex-1 bg-secondary/50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{c.author_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.created_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicionar comentário..."
            rows={2}
            className="flex-1"
          />
          <button
            onClick={sendComment}
            disabled={sending || !newComment.trim()}
            className="self-end px-4 py-2.5 bg-ifal-green text-white rounded-xl text-sm font-medium hover:bg-ifal-green-dark disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}