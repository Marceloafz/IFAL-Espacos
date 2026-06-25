import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Map, Building2, Wrench, CalendarDays, Megaphone, BarChart3, User, Settings, Menu, X, Search, Bell, LogOut, ChevronLeft } from 'lucide-react';
import { ifalsi } from '@/api/ifalsiClient';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Map, label: 'Mapa', path: '/mapa' },
  { icon: Building2, label: 'Salas', path: '/salas' },
  { icon: Wrench, label: 'Infraestrutura', path: '/infraestrutura' },
  { icon: CalendarDays, label: 'Reservas', path: '/reservas' },
  { icon: Megaphone, label: 'Avisos', path: '/avisos' },
  { icon: BarChart3, label: 'Estatísticas', path: '/estatisticas' },
  { icon: User, label: 'Perfil', path: '/perfil' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ifal-green flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-sm text-foreground">IFAL Espaços</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/busca" className="p-2 rounded-lg hover:bg-secondary">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link to="/notificacoes" className="p-2 rounded-lg hover:bg-secondary relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-ifal-red rounded-full" />
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border h-full z-20 shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-ifal-green flex items-center justify-center shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-base text-foreground leading-tight">IFAL Espaços</h1>
            <p className="text-xs text-muted-foreground">Campus Maceió Centro</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-ifal-green text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Link to="/configuracoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
            <div className="w-8 h-8 rounded-full bg-ifal-green/10 flex items-center justify-center">
              <User className="w-4 h-4 text-ifal-green" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={() => ifalsi.auth.logout('/')}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 px-1 pb-safe">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 min-w-0 ${
                  active ? 'text-ifal-green' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
          <Link to="/perfil" className={`flex flex-col items-center py-2 px-2 min-w-0 ${isActive('/perfil') ? 'text-ifal-green' : 'text-muted-foreground'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}