import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/add/operators/startWith';
import { map } from 'rxjs/add/operator/map';

@Component({
    selector: 'app-message-sender',
    templateUrl: './message-sender.component.html',
    styleUrls: ['./message-sender.component.css']
})
export class MessageSenderComponent implements OnInit {
    myControl: FormControl = new FormControl();

    options = [
        'One',
        'Two',
        'Three'
    ];

    filteredOptions: Observable<string[]>;

    constructor() { }

    ngOnInit() {
        this.filteredOptions = this.myControl.valueChanges
            .pipe(
            startWith(''),
            map(val => this.filter(val))
            );
    }

    filter(val: string): string[] {
        return this.options.filter(option =>
            option.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }


}
