import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useAuth } from '@/lib/AuthContext';
import { CalendarDays, Plus, Clock, Building2, X, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

export default function Reservations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    room_id: '', room_name: '', title: '', description: '', date: '', start_time: '', end_time: '',
  });

  const urlParams = new URLSearchParams(window.location.search);
  const preRoom = urlParams.get('room');

  useEffect(() => {
    const load = async () => {
      const [res, rms] = await Promise.all([
        ifalsi.entities.Reservation.list('-date', 50),
        ifalsi.entities.Room.list('name', 100),
      ]);
      setReservations(res);
      setRooms(rms);
      if (preRoom) {
        const room = rms.find(r => r.room_id === preRoom);
        if (room) {
          setForm(f => ({ ...f, room_id: room.room_id, room_name: room.name }));
          setShowNew(true);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.room_name || !form.title || !form.date || !form.start_time || !form.end_time) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }
    // Conflict check
    const conflicts = reservations.filter(r =>
      r.room_id === form.room_id && r.date === form.date && r.status !== 'Cancelada' &&
      r.start_time < form.end_time && r.end_time > form.start_time
    );
    if (conflicts.length > 0) {
      toast({ title: 'Conflito de Horário', description: 'Já existe uma reserva nesse horário para esta sala.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await ifalsi.entities.Reservation.create({
        ...form,
        status: 'Confirmada',
        requester_name: user?.full_name || 'Usuário',
        requester_email: user?.email || '',
      });
      setReservations(prev => [res, ...prev]);
      setShowNew(false);
      setForm({ room_id: '', room_name: '', title: '', description: '', date: '', start_time: '', end_time: '' });
      toast({ title: 'Reserva Confirmada!', description: `Sala ${res.room_name} reservada com sucesso.` });
    } catch(e) {
      toast({ title: 'Erro', description: 'Não foi possível criar a reserva.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const cancelReservation = async (id) => {
    await ifalsi.entities.Reservation.update(id, { status: 'Cancelada' });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelada' } : r));
    toast({ title: 'Reserva cancelada.' });
  };

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
        <h1 className="text-2xl font-heading font-bold">Reservas</h1>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 bg-ifal-green text-white rounded-xl text-sm font-medium hover:bg-ifal-green-dark transition-colors">
          <Plus className="w-4 h-4" /> Nova Reserva
        </button>
      </div>

      {/* List */}
      {reservations.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res, i) => (
            <motion.div key={res.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-ifal-green/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-ifal-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{res.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {res.room_name}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {res.date ? new Date(res.date + 'T12:00').toLocaleDateString('pt-BR') : ''}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {res.start_time} - {res.end_time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{res.requester_name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={res.status} />
                  {res.status === 'Confirmada' && (
                    <button onClick={() => cancelReservation(res.id)} className="text-xs text-red-500 hover:underline">Cancelar</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Reservation Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm mb-1.5 block">Sala *</Label>
              <Select value={form.room_name} onValueChange={(v) => {
                const room = rooms.find(r => r.name === v);
                setForm(f => ({ ...f, room_name: v, room_id: room?.room_id || '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Selecione a sala" /></SelectTrigger>
                <SelectContent>
                  {rooms.filter(r => r.status === 'Disponível').map(r => (
                    <SelectItem key={r.id} value={r.name}>{r.name} ({r.room_id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Título *</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Reunião de departamento" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Data *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1.5 block">Início *</Label>
                <Select value={form.start_time} onValueChange={(v) => setForm(f => ({ ...f, start_time: v }))}>
                  <SelectTrigger><SelectValue placeholder="Horário" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Fim *</Label>
                <Select value={form.end_time} onValueChange={(v) => setForm(f => ({ ...f, end_time: v }))}>
                  <SelectTrigger><SelectValue placeholder="Horário" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes da reserva..." rows={2} />
            </div>
            <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-ifal-green text-white rounded-xl font-medium text-sm hover:bg-ifal-green-dark disabled:opacity-50 transition-colors">
              {submitting ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}