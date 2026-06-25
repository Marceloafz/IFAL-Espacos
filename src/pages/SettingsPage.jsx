import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Eye, Moon, Type, Volume2, Accessibility } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-bold">Configurações</h1>
      </div>

      <div className="bg-white rounded-2xl border border-border divide-y divide-border">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Notificações</p>
              <p className="text-xs text-muted-foreground">Receber notificações do sistema</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Modo Escuro</p>
              <p className="text-xs text-muted-foreground">Tema escuro para o sistema</p>
            </div>
          </div>
          <Switch />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Alto Contraste</p>
              <p className="text-xs text-muted-foreground">Melhorar visibilidade dos elementos</p>
            </div>
          </div>
          <Switch />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Fonte Aumentada</p>
              <p className="text-xs text-muted-foreground">Aumentar tamanho do texto</p>
            </div>
          </div>
          <Switch />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Feedback Sonoro</p>
              <p className="text-xs text-muted-foreground">Sons para interações</p>
            </div>
          </div>
          <Switch />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Accessibility className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Reduzir Animações</p>
              <p className="text-xs text-muted-foreground">Menos movimento na tela</p>
            </div>
          </div>
          <Switch />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-4">
        <p className="text-xs text-muted-foreground text-center">IFAL Espaços v1.0 · Campus Maceió Centro</p>
      </div>
    </div>
  );
}