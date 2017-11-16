﻿export class Game {
    id: string;
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
    priority: number;
    active: boolean;
    createDate: Date;
}