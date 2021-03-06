﻿import { Component, Input, Output, OnInit, EventEmitter, ElementRef } from '@angular/core';

import { LoginInfoService } from '../services/loginInfo.service';
import { User } from '../types/user';
import { Game } from '../types/game';

@Component({
    host: {
        '(document:click)': 'onClick($event)',
    },
    selector: 'menu',
    templateUrl: './upper-right-menu.component.html',
    styleUrls: ['./upper-right-menu.component.css']
})
export class UpperRightMenuComponent implements OnInit {
    user: User;
    gameDetail: boolean;
    isOpen: boolean = false;
    @Input() game: Game;
    @Input() alreadyPlaytesting: boolean;
    @Input() alreadyPlaytestedVersion: boolean;
    @Input() feedbackExists: boolean;
    @Input() gamesList: boolean;
    @Input() playtesting: boolean;
    @Input() canModerate: boolean;
    @Input() feedbackId: string;
    @Input() moderateId: string;
    @Input() editProfile: boolean;
    @Input() addGame: boolean;
    @Input() applyPoints: boolean;
    @Input() viewMessages: boolean;
    @Input() playtestingWait: boolean;
    @Input() deletingWait: boolean;
    @Input() undeletingWait: boolean;
    @Output() playtestGame: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteGame: EventEmitter<any> = new EventEmitter<any>();
    @Output() undeleteGame: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _eref: ElementRef, private loginInfoService: LoginInfoService) {
    }

    ngOnInit() {
        this.gameDetail = !!this.game;

        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
        });
    }

    open() {
        this.isOpen = !this.isOpen;
    }

    onClick(event) {
        if (!this._eref.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }

    playtestGameClicked() {
        this.playtestGame.emit();
    }
    deleteGameClicked() {
        this.deleteGame.emit();
    }
    undeleteGameClicked() {
        this.undeleteGame.emit();
    }

    logout() {
        this.loginInfoService.logout();
    }
}
