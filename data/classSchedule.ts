export interface ClassSchedule {
  id: string;
  title: string;
  instructor: string;
  startTime: string;
  endTime: string;
  days: string[];
  current?: boolean;
}

export const classSchedule: ClassSchedule[] = [
  {
    id: '1',
    title: 'Muay Thai - Turma Mista (Noite)',
    instructor: 'Mestre William',
    startTime: '19:30',
    endTime: '20:30',
    days: ['Segunda', 'Quarta', 'Sexta'],
    current: true,
  },
  {
    id: '2',
    title: 'Jiu-Jitsu - Turma Mista (Noite)',
    instructor: 'Mestre William',
    startTime: '20:00',
    endTime: '21:00',
    days: ['Terça', 'Quinta'],
    current: true,
  },
  {
    id: '3',
    title: 'Boxe Misto (Noite)',
    instructor: 'Instrutor Gustavo',
    startTime: '18:30',
    endTime: '19:30',
    days: ['Terça', 'Quinta'],
    current: true,
  },
  {
    id: '4',
    title: 'Boxe Misto (Manhã de Sábado)',
    instructor: 'Instrutor Gustavo',
    startTime: '09:00',
    endTime: '10:00',
    days: ['Sábado'],
    current: true,
  },
  {
    id: '5',
    title: 'Jiu-Jitsu - Turma Feminina',
    instructor: 'Instrutor Aline',
    startTime: '18:30',
    endTime: '19:30',
    days: ['Segunda', 'Quarta', 'Sexta'],
    current: true,
  },
  {
    id: '6',
    title: 'Jiu-Jitsu - Turma Mista / Kids (Manhã)',
    instructor: 'Mestre William',
    startTime: '08:00',
    endTime: '09:00',
    days: ['Terça', 'Quinta', 'Sábado'],
    current: true,
  },
  {
    id: '7',
    title: 'Jiu-Jitsu - Turma Baby (Até 4 Anos)',
    instructor: 'Mestre William',
    startTime: '18:00',
    endTime: '18:45',
    days: ['Terça', 'Quinta'],
    current: true,
  },
  {
    id: '8',
    title: 'Jiu-Jitsu - Turma Kids (Até 6 Anos)',
    instructor: 'Mestre William',
    startTime: '18:30',
    endTime: '19:15',
    days: ['Terça', 'Quinta'],
    current: true,
  },
  {
    id: '9',
    title: 'Jiu-Jitsu - Turma Kids (Até 12 Anos)',
    instructor: 'Mestre William',
    startTime: '19:15',
    endTime: '20:00',
    days: ['Terça', 'Quinta'],
    current: true,
  },
  {
    id: '10',
    title: 'Jiu-Jitsu - Turma Mista No-Gi',
    instructor: 'Mestre William',
    startTime: '19:30',
    endTime: '20:30',
    days: ['Sexta'],
    current: true,
  },
  {
    id: '11',
    title: 'Muay Thai - Turma Mista (Manhã)',
    instructor: 'Mestre William',
    startTime: '08:00',
    endTime: '09:00',
    days: ['Segunda', 'Quarta', 'Sexta'],
    current: true,
  },
  {
    id: '12',
    title: 'Muay Thai - Turma Kids',
    instructor: 'Instrutor Rui',
    startTime: '19:30',
    endTime: '20:30',
    days: ['Segunda', 'Quarta', 'Sexta'],
    current: true,
  },
  {
    id: '13',
    title: 'Muay Thai - Turma Mista (Noite)',
    instructor: 'Mestre William',
    startTime: '18:30',
    endTime: '19:30',
    days: ['Segunda', 'Quarta', 'Sexta'],
    current: true,
  },
];