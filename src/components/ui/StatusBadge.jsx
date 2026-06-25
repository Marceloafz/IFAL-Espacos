import React from 'react';

const statusConfig = {
  'Disponível': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Ocupada': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  'Reservada': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Em Manutenção': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Recebido': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Em Análise': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Em Atendimento': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Aguardando Peça': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Concluído': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Cancelado': { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
  'Confirmada': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Pendente': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Baixa': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Média': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Alta': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Crítica': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  'Normal': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Importante': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Urgente': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function StatusBadge({ status, className = '' }) {
  const config = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}