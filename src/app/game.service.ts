import { Injectable } from '@angular/core';

import { Game } from './game';
import { GAMES } from './mock-games';

@Injectable()
export class GameService {
    getGames(): Promise<Game[]> {
        return Promise.resolve(GAMES);
    }

    getGame(id: number): Promise<Game> {
        return this.getGames()
            .then(games => games.find(g => g.id === id));
    }
}