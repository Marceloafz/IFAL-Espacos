import React, { useState, useEffect } from 'react';
import { ifalsi } from '@/api/ifalsiClient';
import { useNavigate } from 'react-router-dom';
import CampusMap from '@/components/campus/CampusMap';
import StatusBadge from '@/components/ui/StatusBadge';
import { Building2, Search, X, MapPin, Users, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function CampusMapPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ifalsi.entities.Room.list('-created_date', 100).then(r => { setRooms(r); setLoading(false); });
  }, []);

  const filtered = rooms.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.room_id?.toLowerCase().includes(search.toLowerCase()) ||
    r.block?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6 pb-0">
        <h1 className="text-2xl font-heading font-bold mb-4">Mapa do Campus</h1>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-6 pt-2 min-h-0">
        {/* Map */}
        <div className="flex-1 min-h-[300px]">
          <CampusMap
            rooms={rooms}
            selectedRoomId={selectedRoom?.id}
            onSelectRoom={(room) => setSelectedRoom(room)}
            className="h-full"
          />
        </div>

        {/* Side panel */}
        <div className="w-full md:w-80 bg-white rounded-2xl border border-border flex flex-col max-h-[400px] md:max-h-full">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar sala..."
                className="pl-9 bg-secondary/50 border-0"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filtered.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  selectedRoom?.id === room.id ? 'bg-ifal-green/10 border border-ifal-green/20' : 'hover:bg-secondary'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-ifal-green/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-ifal-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                  <p className="text-xs text-muted-foreground">{room.block}</p>
                </div>
                <StatusBadge status={room.status} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected room detail */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-xl border border-border p-4 z-20"
          >
            <button onClick={() => setSelectedRoom(null)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-secondary">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-ifal-green/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-ifal-green" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedRoom.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedRoom.room_id} · {selectedRoom.block}</p>
                <StatusBadge status={selectedRoom.status} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5" /> {selectedRoom.capacity} pessoas
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {selectedRoom.room_type}
              </div>
            </div>
            <button
              onClick={() => navigate(`/salas/${selectedRoom.id}`)}
              className="w-full py-2.5 bg-ifal-green text-white rounded-xl text-sm font-medium hover:bg-ifal-green-dark transition-colors"
            >
              Ver Detalhes
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}