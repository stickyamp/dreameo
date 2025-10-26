import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { App } from '@capacitor/app';
import { LoggerService } from './log.service';

@Injectable({
    providedIn: 'root'
})
export class VersionService {
    private versionUrl =
        'https://api.allorigins.win/raw?url=' +
        encodeURIComponent(`https://gist.githubusercontent.com/stickyamp/3ab59e2e07b5fe15d12271721a0b951c/raw/dreameo.json?ts=${Date.now()}`);
    constructor(private http: HttpClient, private loggerService: LoggerService) { }

    async checkForUpdate(): Promise<boolean> {
        try {
            // 👇 Fetch remote JSON
            const remoteData: any = await firstValueFrom(this.http.get(this.versionUrl));
            const remoteVersion = remoteData.APP_VERSION;

            // 👇 Get local app version from Capacitor
            const info = await App.getInfo();
            const localVersion = info.version;

            console.log('Local version:', localVersion);
            console.log('Remote version:', remoteVersion);
            this.loggerService.log(`Local version ${localVersion}`);
            this.loggerService.log(`Remote version ${remoteVersion}`);
            return this.isNewerVersion(remoteVersion, localVersion);
        } catch (err) {
            this.loggerService.log(`Error in version checker ${err}`);
            console.error('Error checking version:', err);
            return false;
        }
    }

    private isNewerVersion(remote: string, local: string): boolean {
        const r = remote.split('.').map(Number);
        const l = local.split('.').map(Number);
        for (let i = 0; i < r.length; i++) {
            if (r[i] > (l[i] || 0)) return true;
            if (r[i] < (l[i] || 0)) return false;
        }
        return false;
    }
}
