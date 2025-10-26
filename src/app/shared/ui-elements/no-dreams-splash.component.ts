// Component TypeScript (no-dreams.component.ts)
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { LoggerService } from '../services/log.service';

@Component({
    selector: 'app-no-dreams',
    standalone: true,
    imports: [IonicModule, CommonModule, HttpClientModule, TranslatePipe,
        TranslateDirective],
    templateUrl: './no-dreams-splash.component.html',
    styleUrls: ['./no-dreams-splash.component.scss']
})
export class NoDreamsComponent {
    constructor() { }
    ngOnInit() {
    }
}