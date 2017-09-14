import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';
import { Game } from './game';

@Component({
    selector: 'leave-feedback',
    templateUrl: './leave-feedback.component.html',
    styleUrls: ['./leave-feedback.styles.css']
})
export class LeaveFeedbackComponent implements OnInit {
    constructor(private router: Router,
        private route: ActivatedRoute,
        private dbService: DbService) { }
    
    saveFeedback(): void {
//        this.dbService.updateGame(this.game);
    }

    ngOnInit(): void {
    }
}
