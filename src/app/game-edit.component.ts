import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { User } from './user';
import { BusinessService } from './business.service';
import { Game } from './game';

@Component({
    selector: 'game-edit',
    templateUrl: './game-edit.component.html',
    styleUrls: ['./game-edit.styles.css']
})
export class GameEditComponent implements OnInit {
    game: Game;
    message: Subject<string>;
    messageActive: string;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private business: BusinessService) { }
    
    saveGame(): void {
        this.business.updateGame(this.game, (response) => {
            this.message.next("Saved!");
            this.messageActive = "message";
        });
    }

    onChange(): void {
        this.message.next("");
        this.messageActive = "";
    }

    ngOnInit(): void {
        this.route.paramMap
            .switchMap((params: ParamMap) => this.business.getGame(params.get('id')))
            .subscribe(g => g.subscribe(game => {
                this.game = game;
            }));
        this.message = new Subject<string>();
    }
}
