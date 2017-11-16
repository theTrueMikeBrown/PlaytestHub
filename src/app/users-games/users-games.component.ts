import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { Game } from '../types/game';
import { User } from '../types/user';

@Component({
    selector: 'users-games',
    templateUrl: './users-games.component.html',
    styleUrls: ['./users-games.styles.css']
})
export class UsersGamesComponent implements OnInit {
    games: Observable<Game[]>;
    profile: User;
    user: User;

    constructor(private business: BusinessService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
        });

        this.route.paramMap.subscribe((params: ParamMap) => {
            let id: string = params.get('id');
            this.business.getUser(id).then(u => u.subscribe(user => this.profile = user));

            var userId = this.user ? this.user.id : null;

            this.business.getGamesByUser(id, userId).then(g => this.games = g);
        });
    }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }
}
