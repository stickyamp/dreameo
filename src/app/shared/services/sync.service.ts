import { Injectable } from '@angular/core';
import { FirebaseDreamService } from './firebase-dream.service';
import { DreamService } from './dream.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DreamsByDate, Dream } from '../../models/dream.model';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncInProgressSubject = new BehaviorSubject<boolean>(false);
  public syncInProgress$ = this.syncInProgressSubject.asObservable();

  private lastSyncTimeSubject = new BehaviorSubject<Date | null>(null);
  public lastSyncTime$ = this.lastSyncTimeSubject.asObservable();

  constructor(
    private firebaseDreamService: FirebaseDreamService,
    private localDreamService: DreamService,
    private authService: FirebaseAuthService
  ) {
    this.initializeSync();
  }

  private initializeSync() {
    // Escuchar cambios en la autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    });
  }

  private startAutoSync() {
    // Sincronizar automáticamente cada 5 minutos
    setInterval(() => {
      if (this.authService.isAuthenticated()) {
        this.syncData();
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  private stopAutoSync() {
    // Limpiar intervalos si es necesario
  }

  async syncData(): Promise<void> {
    if (!this.authService.isAuthenticated() || this.syncInProgressSubject.value) {
      return;
    }

    this.syncInProgressSubject.next(true);

    try {
      // Obtener datos locales y de Firebase
      const localDreams = await this.getLocalDreams();
      const firebaseDreams = await this.getFirebaseDreams();

      // Detectar conflictos y resolverlos
      const conflicts = this.detectConflicts(localDreams, firebaseDreams);

      if (conflicts.length > 0) {
        console.log('Conflicts detected:', conflicts);
        // Por ahora, priorizar Firebase (último en ganar)
        await this.resolveConflicts(conflicts, firebaseDreams);
      }

      // Sincronizar datos faltantes
      await this.syncMissingData(localDreams, firebaseDreams);

      this.lastSyncTimeSubject.next(new Date());
      console.log('Data sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgressSubject.next(false);
    }
  }

  private async getLocalDreams(): Promise<DreamsByDate> {
    return new Promise((resolve) => {
      this.localDreamService.dreams$.pipe(take(1)).subscribe(dreams => {
        resolve(dreams);
      });
    });
  }

  private async getFirebaseDreams(): Promise<DreamsByDate> {
    return new Promise((resolve) => {
      this.firebaseDreamService.dreams$.pipe(take(1)).subscribe(dreams => {
        resolve(dreams);
      });
    });
  }

  private detectConflicts(localDreams: DreamsByDate, firebaseDreams: DreamsByDate): Dream[] {
    const conflicts: Dream[] = [];

    // Buscar sueños con el mismo ID pero diferentes timestamps
    for (const date in localDreams) {
      if (localDreams[date]) {
        for (const localDream of localDreams[date]) {
          const firebaseDream = this.findDreamById(firebaseDreams, localDream.id);

          if (firebaseDream && this.hasConflict(localDream, firebaseDream)) {
            conflicts.push(localDream);
          }
        }
      }
    }

    return conflicts;
  }

  private findDreamById(dreams: DreamsByDate, id: string): Dream | null {
    for (const date in dreams) {
      if (dreams[date]) {
        const dream = dreams[date].find(d => d.id === id);
        if (dream) return dream;
      }
    }
    return null;
  }

  private hasConflict(localDream: Dream, firebaseDream: Dream): boolean {
    // Considerar conflicto si las fechas de actualización son diferentes
    const localUpdated = localDream.updatedAt || localDream.createdAt;
    const firebaseUpdated = firebaseDream.updatedAt || firebaseDream.createdAt;

    return localUpdated !== firebaseUpdated;
  }

  private async resolveConflicts(conflicts: Dream[], firebaseDreams: DreamsByDate): Promise<void> {
    // Estrategia simple: priorizar Firebase
    // En una implementación más avanzada, podrías mostrar un diálogo al usuario
    console.log('Resolving conflicts by prioritizing Firebase data');
  }

  private async syncMissingData(localDreams: DreamsByDate, firebaseDreams: DreamsByDate): Promise<void> {
    // Sincronizar datos locales que no están en Firebase
    for (const date in localDreams) {
      if (localDreams[date]) {
        for (const localDream of localDreams[date]) {
          const firebaseDream = this.findDreamById(firebaseDreams, localDream.id);

          if (!firebaseDream) {
            // Subir a Firebase
            try {
              await this.firebaseDreamService.addDream(localDream);
              console.log('Uploaded local dream to Firebase:', localDream.id);
            } catch (error) {
              console.error('Error uploading dream to Firebase:', error);
            }
          }
        }
      }
    }

    // Sincronizar datos de Firebase que no están localmente
    for (const date in firebaseDreams) {
      if (firebaseDreams[date]) {
        for (const firebaseDream of firebaseDreams[date]) {
          const localDream = this.findDreamById(localDreams, firebaseDream.id);

          if (!localDream) {
            // Descargar a local
            try {
              await this.localDreamService.addDream(firebaseDream);
              console.log('Downloaded Firebase dream to local:', firebaseDream.id);
            } catch (error) {
              console.error('Error downloading dream to local:', error);
            }
          }
        }
      }
    }
  }

  async forceSync(): Promise<void> {
    await this.syncData();
  }

  getSyncStatus(): Observable<{ inProgress: boolean; lastSync: Date | null }> {
    return combineLatest([
      this.syncInProgress$,
      this.lastSyncTime$
    ]).pipe(
      map(([inProgress, lastSync]) => ({
        inProgress,
        lastSync
      }))
    );
  }
}
