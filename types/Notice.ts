// src/types/Notice.ts
export interface Notice {
  id: string;
  title: string;
  category: 'Evento' | 'Comunicado' | 'Urgente' | 'Novidade';
  date: string;
  time: string;
  description: string;
  color: 'bg-fight-yellow' | 'bg-gray-700' | 'bg-punch-red' | 'bg-green-500';
}
