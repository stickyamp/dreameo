// Component TypeScript (no-dreams.component.ts)
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { LoggerService } from '../../services/log.service';

@Component({
    selector: 'app-no-dreams',
    standalone: true,
    imports: [IonicModule, CommonModule, HttpClientModule, TranslatePipe,
        TranslateDirective],
    template: '<div>Logs:</div><div>{{logs}}</div>'
})
export class LogViewerComponent {
    constructor(private loggerService: LoggerService) { }
    logs: string = "";
    ngOnInit() {
        this.logs = this.loggerService.getLogs();
    }
}