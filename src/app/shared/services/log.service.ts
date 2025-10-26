import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {

    private logs: string[] = [];

    /**
     * Logs a message to both console and internal memory
     * @param message Message or object to log
     */
    log(message: any): void {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${typeof message === 'object' ? JSON.stringify(message) : message}`;
        console.log(logEntry);
        this.logs.push(logEntry);
    }

    /**
     * Returns all logs as a single string
     */
    getLogs(): string {
        return this.logs.join('\n');
    }

    /**
     * Returns logs as an array (for *ngFor display)
     */
    getLogsArray(): string[] {
        return [...this.logs];
    }

    /**
     * Clears the log history
     */
    clear(): void {
        this.logs = [];
    }
}