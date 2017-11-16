import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { Game } from '../types/game';
import { User } from '../types/user';

@Component({
    selector: 'apply-points',
    templateUrl: './apply-points.component.html',
    styleUrls: ['./apply-points.styles.css']
})
export class ApplyPointsComponent {
    games: Observable<Game[]>;
    user: User;
    selectedGame: string;
    points: number = 1;
    message: Subject<string>;
    messageActive: string;
    selectedGameObj: Game;
    saving: boolean = false;

    constructor(
        private business: BusinessService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            let id: string = params.get('id');
            this.selectedGame = id;
            this.gameSelected(id);
        });
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.business.getGamesByUser(user.id).then(g => this.games = g);
        });
        this.message = new Subject<string>();
    }

    applyPoints(): void {
        this.saving = true;
        this.business.applyPoints(this.selectedGame, this.points, this.user.uid, (r) => {
            this.saving = false;

            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': r.text() },
            };
            this.router.navigate(['/games'], navigationExtras);
        });
    }

    onChange(): void {
        this.message.next("");
        this.messageActive = "";
    }

    gameSelected(id): void {
        this.business.getGame(id).then(g => g.subscribe(game => this.selectedGameObj = game));
    }
}
