import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES = ['Ar Condicionado', 'Projetor', 'Computadores', 'Internet', 'Energia', 'Iluminação', 'Banheiro', 'Limpeza', 'Mobiliário', 'Portas', 'Janelas', 'Telhado', 'Infiltração', 'Segurança', 'Acessibilidade', 'Outros'];

export default function NewTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [protocol, setProtocol] = useState('');
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({
    room_id: '', room_name: '', category: '', description: '', priority: 'Média',
  });

  const urlParams = new URLSearchParams(window.location.search);
  const preRoom = urlParams.get('room');
  const preRoomName = urlParams.get('room_name');

  useEffect(() => {
    ifalsi.entities.Room.list('name', 100).then(setRooms);
    if (preRoom) setForm(f => ({ ...f, room_id: preRoom, room_name: preRoomName || '' }));
  }, []);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const { file_url } = await ifalsi.integrations.Core.UploadFile({ file });
      setPhotos(prev => [...prev, file_url]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.room_name || !form.category || !form.description) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const proto = `CHM-${Date.now().toString().slice(-8)}`;
      await ifalsi.entities.Ticket.create({
        ...form,
        protocol: proto,
        photos,
        requester_name: user?.full_name || 'Usuário',
        requester_email: user?.email || '',
        status: 'Recebido',
      });
      setProtocol(proto);
      setSuccess(true);
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível criar o chamado.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-ifal-green/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-ifal-green" />
        </div>
        <h2 className="text-xl font-heading font-bold mb-2">Chamado Aberto com Sucesso!</h2>
        <p className="text-muted-foreground text-sm mb-1">Protocolo:</p>
        <p className="text-2xl font-mono font-bold text-ifal-green mb-6">{protocol}</p>
        <p className="text-sm text-muted-foreground mb-6">Você receberá atualizações sobre o andamento.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/infraestrutura')} className="px-6 py-2.5 bg-ifal-green text-white rounded-xl text-sm font-medium">
            Ver Chamados
          </button>
          <button onClick={() => { setSuccess(false); setForm({ room_id: '', room_name: '', category: '', description: '', priority: 'Média' }); setPhotos([]); }} className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium">
            Novo Chamado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-bold">Novo Chamado</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Local / Sala *</Label>
            <Select value={form.room_name} onValueChange={(v) => {
              const room = rooms.find(r => r.name === v);
              setForm(f => ({ ...f, room_name: v, room_id: room?.room_id || '' }));
            }}>
              <SelectTrigger><SelectValue placeholder="Selecione a sala" /></SelectTrigger>
              <SelectContent>
                {rooms.map(r => (<SelectItem key={r.id} value={r.name}>{r.name} ({r.room_id})</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">Categoria *</Label>
            <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">Prioridade *</Label>
            <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Baixa', 'Média', 'Alta', 'Crítica'].map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">Descrição *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descreva o problema com o máximo de detalhes..."
              rows={4}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">Fotos (opcional)</Label>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-ifal-green/50 hover:bg-ifal-green/5 transition-all">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Clique para enviar fotos</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-ifal-green text-white rounded-xl font-medium text-sm hover:bg-ifal-green-dark transition-colors disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Enviar Chamado'}
        </button>
      </form>
    </div>
  );
}