// src/data/classSchedule.ts
export interface ClassSchedule {
  id: string;
  title: string;
  instructor: string;
  startTime: string; // Formato: "HH:MM"
  endTime: string;   // Formato: "HH:MM"
  days: string[];
  current?: boolean;
}

export const classSchedule: ClassSchedule[] = [
  {
    id: '1',
    title: 'Muay Thai Iniciante',
    instructor: 'Mestre William',
    startTime: '18:00',
    endTime: '19:00',
    days: ['Segunda', 'Quarta', 'Sexta'],
    current: true
  },
  {
    id: '2',
    title: 'Muay Thai Avançado',
    instructor: 'Mestre William',
    startTime: '19:00',
    endTime: '20:00',
    days: ['Segunda', 'Quarta', 'Sexta']
  },
  {
    id: '3',
    title: 'Jiu-Jitsu Iniciante',
    instructor: 'Professor Carlos',
    startTime: '03:34',
    endTime: '3:50',
    days: ['Terça', 'Quinta']
  },
  {
    id: '4',
    title: 'Jiu-Jitsu Avançado',
    instructor: 'Professor Carlos',
    startTime: '21:00',
    endTime: '22:00',
    days: ['Terça', 'Quinta']
  },
  {
    id: '5',
    title: 'Boxe Fitness',
    instructor: 'Instrutor Ana',
    startTime: '17:00',
    endTime: '18:00',
    days: ['Segunda', 'Quarta', 'Sexta']
  }
];