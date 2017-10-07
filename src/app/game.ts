export class Game {
    id: number;
    name: string;
    owner: string;
    ownerName: string;
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
}