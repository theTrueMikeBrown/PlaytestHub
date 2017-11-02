import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { LoginInfoService } from './loginInfo.service';

import { Game } from './game';
import { User } from './user';
import { BusinessService } from './business.service';

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
            this.business.getGamesByUser(id).then(g => this.games = g);
        });
      }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }
}
