import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useAuth } from '@/lib/AuthContext';
import { Megaphone, Plus, Calendar, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const categoryColors = {
  'Interdição': 'bg-red-50 text-red-700',
  'Evento': 'bg-blue-50 text-blue-700',
  'Manutenção': 'bg-amber-50 text-amber-700',
  'Horário': 'bg-purple-50 text-purple-700',
  'Direção': 'bg-ifal-green/10 text-ifal-green',
  'Geral': 'bg-gray-50 text-gray-700',
};

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'Geral', priority: 'Normal' });

  useEffect(() => {
    ifalsi.entities.Announcement.list('-created_date', 50).then(a => { setAnnouncements(a); setLoading(false); });
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha título e conteúdo.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const a = await ifalsi.entities.Announcement.create({
        ...form,
        author_name: user?.full_name || 'Administração',
        is_active: true,
      });
      setAnnouncements(prev => [a, ...prev]);
      setShowNew(false);
      setForm({ title: '', content: '', category: 'Geral', priority: 'Normal' });
      toast({ title: 'Aviso publicado!' });
    } catch(e) {
      toast({ title: 'Erro', description: 'Não foi possível publicar.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Avisos</h1>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 bg-ifal-green text-white rounded-xl text-sm font-medium hover:bg-ifal-green-dark transition-colors">
          <Plus className="w-4 h-4" /> Novo Aviso
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum aviso publicado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[a.category] || categoryColors.Geral}`}>
                    {a.category}
                  </span>
                  <StatusBadge status={a.priority} />
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {new Date(a.created_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 className="font-semibold text-base mb-1">{a.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
              {a.author_name && (
                <p className="text-xs text-muted-foreground mt-3">Por: {a.author_name}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Aviso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm mb-1.5 block">Título *</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do aviso" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Geral', 'Interdição', 'Evento', 'Manutenção', 'Horário', 'Direção'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Normal', 'Importante', 'Urgente'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Conteúdo *</Label>
              <Textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Conteúdo do aviso..." rows={4} />
            </div>
            <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-ifal-green text-white rounded-xl font-medium text-sm hover:bg-ifal-green-dark disabled:opacity-50">
              {submitting ? 'Publicando...' : 'Publicar Aviso'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}