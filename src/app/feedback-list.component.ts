import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { LoginInfoService } from './loginInfo.service';

import { Feedback } from './feedback';
import { Game } from './game';
import { User } from './user';
import { BusinessService } from './business.service';

@Component({
    selector: 'feedback-list',
    templateUrl: './feedback-list.component.html',
    styleUrls: ['./feedback-list.styles.css']
})
export class FeedbackListComponent implements OnInit {
    feedbacks: Observable<Feedback[]>;
    game: Game;
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
            this.business.getFeedbackForGame(id).then(feedbacks => this.feedbacks = feedbacks);
            this.business.getGame(id).then(g => g.subscribe(game => this.game = game));
        });
      }

    gotoFeedback(id: number): void {
        this.router.navigate(['/feedback', id]);
    }
}
