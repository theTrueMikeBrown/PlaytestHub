import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { LoginInfoService } from './loginInfo.service';
import { DbService } from './db.service';
import { Game } from './game';
import { User } from './user';

@Component({
    selector: 'apply-points',
    templateUrl: './apply-points.component.html',
    styleUrls: ['./apply-points.styles.css'],
    providers: [DbService]
})
export class ApplyPointsComponent {
    games: Observable<Game[]>;
    user: User;
    selectedGame: string;
    points: number = 1;
    message: Subject<string>;
    messageActive: string;

    constructor(
        private dbService: DbService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            let id: string = params.get('id');
            this.selectedGame = id;
        });
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.dbService.getGamesByUser(user.id).then(g => this.games = g);
        });
        this.message = new Subject<string>();
    }

    applyPoints(): void {
        this.dbService.applyPoints(this.selectedGame, this.points, this.user.uid, (r) => {
            this.message.next(r.text());
            this.messageActive = "message";
            this.loginInfoService.getLoginInfo().then(user => {
                this.user = user;
            });
        });
    }

    onChange(): void {
        this.message.next("");
        this.messageActive = "";
    }
}