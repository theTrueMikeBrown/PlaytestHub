import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-funnel-page',
    templateUrl: './funnel-page.component.html',
    styleUrls: ['./funnel-page.component.css']
})
export class FunnelPageComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit() {
    }

    designer() {
        localStorage.setItem('phFunnelChoice', 'designer');
        this.router.navigate(['/games']);
    }

    publisher() {
        localStorage.setItem('phFunnelChoice', 'publisher');
        this.router.navigate(['/games']);
    }

    player() {
        localStorage.setItem('phFunnelChoice', 'player');
        this.router.navigate(['/games']);
    }
}
