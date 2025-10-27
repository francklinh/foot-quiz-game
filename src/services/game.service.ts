export interface Top10Answer {
  position: number;
  player: string;
  isCorrect: boolean;
}

export interface GridData {
  [key: string]: string;
}

export interface Player {
  id: string;
  name: string;
  current_club: string;
  nationality: string;
  position: string;
}

export class GameService {
  calculateTop10Score(answers: Top10Answer[]): number {
    return answers.filter(answer => answer.isCorrect).length;
  }

  validateGridIntersection(
    gridData: GridData,
    nationality: string,
    league: string,
    playerName: string
  ): boolean {
    const key = `${nationality}-${league}`;
    return gridData[key] === playerName;
  }

  calculateGridScore(gridData: GridData): number {
    const totalCells = Object.keys(gridData).length;
    const filledCells = Object.values(gridData).filter(value => value !== '').length;
    return filledCells;
  }

  validateClubGuess(player: Player, guess: string): boolean {
    return player.current_club.toLowerCase() === guess.toLowerCase();
  }

  calculateTimeBasedScore(timeRemaining: number, isCorrect: boolean): number {
    if (!isCorrect) return 0;
    return timeRemaining;
  }

  calculateCerises(score: number, gameType: string): number {
    let multiplier = 1;

    // Different multipliers per game type
    switch (gameType) {
      case 'TOP10':
        multiplier = 1;
        break;
      case 'GRILLE':
        multiplier = 1.5;
        break;
      case 'CLUB':
        multiplier = 2;
        break;
      default:
        multiplier = 1;
    }

    let cerises = Math.floor(score * multiplier);

    // Bonus for perfect score
    if (score === 100) {
      cerises = Math.floor(cerises * 1.5);
    }

    return cerises;
  }

  createSoloMatch(gameType: string): any {
    return {
      mode: 'SOLO',
      status: 'ACTIVE',
      gameType,
      createdAt: new Date(),
    };
  }

  createMultiplayerMatch(gameType: string, participants: string[]): any {
    return {
      mode: 'MULTIPLAYER',
      status: 'PENDING',
      gameType,
      participants,
      createdAt: new Date(),
    };
  }

  createLeagueMatch(gameType: string, leagueId: string): any {
    return {
      mode: 'LEAGUE',
      status: 'PENDING',
      gameType,
      leagueId,
      createdAt: new Date(),
    };
  }
}




