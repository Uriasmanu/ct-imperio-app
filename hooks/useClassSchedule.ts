import { classSchedule, ClassSchedule } from "@/data/classSchedule";
import { useCallback, useEffect, useState } from "react";

export const useClassSchedule = () => {
  const [currentClasses, setCurrentClasses] = useState<ClassSchedule[]>([]);
  const [nextClass, setNextClass] = useState<ClassSchedule | null>(null);
  const [progressMap, setProgressMap] = useState<{ [key: string]: number }>({});

  const timeToMinutes = useCallback((timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }, []);

  const getTodayDay = useCallback((): string => {
    const days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return days[new Date().getDay()];
  }, []);

  const calculateClasses = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentTimeInMinutes =
      currentHour * 60 + currentMinute + currentSecond / 60;

    const today = getTodayDay();
    const todayClasses = classSchedule
      .filter((classItem) => classItem.days.includes(today))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    const foundCurrentClasses: ClassSchedule[] = [];
    const newProgressMap: { [key: string]: number } = {};
    let foundNextClass: ClassSchedule | null = null;

    todayClasses.forEach((classItem) => {
      const startTimeInMinutes = timeToMinutes(classItem.startTime);
      const endTimeInMinutes = timeToMinutes(classItem.endTime);

      if (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      ) {
        foundCurrentClasses.push(classItem);
        const totalDuration = endTimeInMinutes - startTimeInMinutes;
        const elapsedTime = currentTimeInMinutes - startTimeInMinutes;
        const progress = (elapsedTime / totalDuration) * 100;
        newProgressMap[classItem.title] = Math.min(Math.max(progress, 0), 100);
      }
    });

    if (foundCurrentClasses.length === 0) {
      foundNextClass =
        todayClasses.find((classItem) => {
          const classStartTime = timeToMinutes(classItem.startTime);
          return currentTimeInMinutes < classStartTime;
        }) || null;
    }

    setCurrentClasses(foundCurrentClasses);
    setNextClass(foundNextClass);
    setProgressMap(newProgressMap);
  }, [getTodayDay, timeToMinutes]);

  useEffect(() => {
    calculateClasses();
    const interval = setInterval(calculateClasses, 1000);
    return () => clearInterval(interval);
  }, [calculateClasses]);

  return {
    currentClasses,
    nextClass,
    progressMap,
    getClassId: (classItem: ClassSchedule) =>
      `${classItem.title}-${classItem.startTime}-${classItem.endTime}`,
    getGradientColor: (progress: number): string => {
      const baseBlue = 150;
      const additionalBlue = Math.floor((progress / 100) * 105);
      const blueValue = baseBlue + additionalBlue;
      return `rgb(30, 70, ${blueValue})`;
    },
  };
};
