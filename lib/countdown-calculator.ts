// Calculateur de compte à rebours pour les tirages Loto
export interface NextDrawInfo {
  date: Date;
  dayName: string;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  totalSeconds: number;
  isToday: boolean;
  isPast: boolean;
}

export class CountdownCalculator {
  
  /**
   * Calcule le prochain tirage Loto (Mercredi ou Samedi à 20h30)
   */
  public getNextDrawInfo(): NextDrawInfo {
    const now = new Date();
    const nextDraw = this.calculateNextDrawDate(now);
    const timeRemaining = this.calculateTimeRemaining(now, nextDraw);
    
    return {
      date: nextDraw,
      dayName: this.getDayName(nextDraw.getDay()),
      timeRemaining,
      totalSeconds: this.getTotalSeconds(timeRemaining),
      isToday: this.isToday(now, nextDraw),
      isPast: nextDraw < now
    };
  }
  
  /**
   * Calcule la date du prochain tirage
   */
  private calculateNextDrawDate(now: Date): Date {
    const drawTime = { hours: 20, minutes: 30, seconds: 0 }; // 20h30
    
    // Jours de tirage : 3 = Mercredi, 6 = Samedi
    const drawDays = [3, 6];
    
    let nextDraw = new Date(now);
    
    // Chercher le prochain jour de tirage
    for (let i = 0; i < 7; i++) {
      const testDate = new Date(now);
      testDate.setDate(now.getDate() + i);
      testDate.setHours(drawTime.hours, drawTime.minutes, drawTime.seconds, 0);
      
      const dayOfWeek = testDate.getDay();
      
      // Si c'est un jour de tirage
      if (drawDays.includes(dayOfWeek)) {
        // Si c'est aujourd'hui, vérifier si l'heure n'est pas passée
        if (i === 0 && testDate > now) {
          return testDate;
        }
        // Si c'est un jour futur
        if (i > 0) {
          return testDate;
        }
      }
    }
    
    // Fallback : prochain mercredi
    const fallback = new Date(now);
    const daysUntilWednesday = (3 - now.getDay() + 7) % 7 || 7;
    fallback.setDate(now.getDate() + daysUntilWednesday);
    fallback.setHours(drawTime.hours, drawTime.minutes, drawTime.seconds, 0);
    
    return fallback;
  }
  
  /**
   * Calcule le temps restant
   */
  private calculateTimeRemaining(now: Date, target: Date) {
    const diffMs = target.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    return { days, hours, minutes, seconds };
  }
  
  /**
   * Utilitaires
   */
  private getDayName(dayOfWeek: number): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayOfWeek];
  }
  
  private getTotalSeconds(timeRemaining: { days: number; hours: number; minutes: number; seconds: number }): number {
    return timeRemaining.days * 24 * 60 * 60 + 
           timeRemaining.hours * 60 * 60 + 
           timeRemaining.minutes * 60 + 
           timeRemaining.seconds;
  }
  
  private isToday(now: Date, target: Date): boolean {
    return now.toDateString() === target.toDateString();
  }
  
  /**
   * Formate le temps restant pour l'affichage
   */
  public formatTimeRemaining(timeRemaining: { days: number; hours: number; minutes: number; seconds: number }): string {
    const { days, hours, minutes, seconds } = timeRemaining;
    
    if (days > 0) {
      return `${days}j ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
    } else if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    } else {
      return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
  }
  
  /**
   * Retourne un message contextuel
   */
  public getContextMessage(drawInfo: NextDrawInfo): string {
    if (drawInfo.isPast) {
      return "Tirage en cours...";
    }
    
    if (drawInfo.isToday) {
      if (drawInfo.timeRemaining.hours < 1) {
        return "🔥 Tirage dans moins d'1 heure !";
      } else if (drawInfo.timeRemaining.hours < 3) {
        return "⏰ Tirage ce soir !";
      } else {
        return `📅 Tirage aujourd'hui à 20h30`;
      }
    }
    
    if (drawInfo.timeRemaining.days === 1) {
      return `📅 Tirage demain (${drawInfo.dayName})`;
    }
    
    return `📅 Prochain tirage ${drawInfo.dayName}`;
  }
}
