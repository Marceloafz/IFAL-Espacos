import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, X, MapPin, Users, Wifi, Monitor, Wind, Projector } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

const BLOCKS = [
  { id: 'A', label: 'Bloco A', x: 80, y: 120, w: 200, h: 140, color: '#0F8A43' },
  { id: 'B', label: 'Bloco B', x: 320, y: 80, w: 180, h: 160, color: '#15A050' },
  { id: 'C', label: 'Bloco C', x: 540, y: 120, w: 200, h: 140, color: '#0A6030' },
  { id: 'D', label: 'Bloco D', x: 200, y: 320, w: 180, h: 120, color: '#2ECC71' },
  { id: 'E', label: 'Bloco E', x: 440, y: 320, w: 180, h: 120, color: '#25A65A' },
  { id: 'ADM', label: 'Administrativo', x: 80, y: 480, w: 240, h: 100, color: '#1A7A3A' },
];

const FACILITIES = [
  { id: 'entrada', label: 'Entrada Principal', x: 380, y: 520, icon: '🚪' },
  { id: 'biblio', label: 'Biblioteca', x: 560, y: 480, icon: '📚' },
  { id: 'refeitorio', label: 'Refeitório', x: 700, y: 320, icon: '🍽️' },
  { id: 'estacionamento', label: 'Estacionamento', x: 700, y: 480, icon: '🅿️' },
  { id: 'auditorio', label: 'Auditório', x: 380, y: 200, icon: '🎤' },
  { id: 'wc1', label: 'Banheiros', x: 260, y: 200, icon: '🚻' },
  { id: 'wc2', label: 'Banheiros', x: 500, y: 200, icon: '🚻' },
];

export default function CampusMap({ rooms = [], selectedRoomId, onSelectRoom, className = '' }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.5, Math.min(3, z + delta)));
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.room-marker')) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e) => {
    if (e.target.closest('.room-marker')) return;
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  useEffect(() => {
    if (selectedRoomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === selectedRoomId);
      if (room && room.map_x && room.map_y) {
        const container = containerRef.current;
        if (container) {
          const cx = container.clientWidth / 2;
          const cy = container.clientHeight / 2;
          setPan({ x: cx - room.map_x * zoom, y: cy - room.map_y * zoom });
          setZoom(z => Math.max(z, 1.2));
        }
      }
    }
  }, [selectedRoomId]);

  const getStatusColor = (status) => {
    const colors = {
      'Disponível': '#2ECC71',
      'Ocupada': '#E74C3C',
      'Reservada': '#F39C12',
      'Em Manutenção': '#E67E22',
    };
    return colors[status] || '#94a3b8';
  };

  return (
    <div className={`relative bg-white rounded-2xl border border-border overflow-hidden ${className}`} ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={handleZoomIn} className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-border">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-border">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleReset} className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-border">
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 border border-border">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Disponível</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Ocupada</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Reservada</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Manutenção</span>
        </div>
      </div>

      {/* SVG Map */}
      <div
        className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 850 600"
          className="w-full h-full"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="850" height="600" fill="url(#grid)" />

          {/* Pathways */}
          <path d="M 80 270 L 740 270" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M 380 80 L 380 530" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M 80 460 L 740 460" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.4" />

          {/* Green areas */}
          <ellipse cx="700" cy="150" rx="60" ry="40" fill="#d4edda" opacity="0.5" />
          <text x="700" y="155" textAnchor="middle" fontSize="10" fill="#0F8A43" fontWeight="500">Área Verde</text>

          {/* Blocks */}
          {BLOCKS.map(block => (
            <g key={block.id}>
              <rect
                x={block.x} y={block.y}
                width={block.w} height={block.h}
                rx="12" ry="12"
                fill={block.color}
                opacity="0.12"
                stroke={block.color}
                strokeWidth="2"
              />
              <text
                x={block.x + block.w / 2}
                y={block.y + 20}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={block.color}
              >
                {block.label}
              </text>
            </g>
          ))}

          {/* Facilities */}
          {FACILITIES.map(f => (
            <g key={f.id}>
              <text x={f.x} y={f.y} textAnchor="middle" fontSize="18">{f.icon}</text>
              <text x={f.x} y={f.y + 16} textAnchor="middle" fontSize="8" fill="#6b7280" fontWeight="500">{f.label}</text>
            </g>
          ))}

          {/* Room markers */}
          {rooms.map(room => {
            if (!room.map_x || !room.map_y) return null;
            const isSelected = room.id === selectedRoomId;
            const isHovered = room.id === hoveredRoom;
            const color = getStatusColor(room.status);
            return (
              <g
                key={room.id}
                className="room-marker cursor-pointer"
                onClick={() => onSelectRoom?.(room)}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {isSelected && (
                  <circle cx={room.map_x} cy={room.map_y} r="18" fill={color} opacity="0.2">
                    <animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={room.map_x} cy={room.map_y}
                  r={isSelected || isHovered ? "10" : "8"}
                  fill={color}
                  stroke="white"
                  strokeWidth="2.5"
                  style={{ transition: 'r 0.2s ease' }}
                />
                <text
                  x={room.map_x}
                  y={room.map_y + 20}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill="#374151"
                >
                  {room.room_id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}