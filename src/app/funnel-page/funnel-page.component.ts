import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginInfoService } from '../services/loginInfo.service';

@Component({
    selector: 'app-funnel-page',
    templateUrl: './funnel-page.component.html',
    styleUrls: ['./funnel-page.component.css']
})
export class FunnelPageComponent implements OnInit {

    constructor(private router: Router,
        private loginInfoService: LoginInfoService) { }

    ngOnInit() {
    }

    designer() {
        this.loginInfoService.setFunnelChoice('designer');
        this.router.navigate(['/games']);
    }

    publisher() {
        this.loginInfoService.setFunnelChoice('publisher');
        this.router.navigate(['/games']);
    }

    player() {
        this.loginInfoService.setFunnelChoice('player');
        this.router.navigate(['/games']);
    }
}
