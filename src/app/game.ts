﻿export class Game {
    id: number;
    name: string;
    owner: string;
    minPlayerCount: number;
    maxPlayerCount: number;
    minTimeInMinutes: number;
    maxTimeInMinutes: number;
    components: string;
    description: string;
    rulesUrl: string;
    pnpUrl: string;
    playcount: number;
}