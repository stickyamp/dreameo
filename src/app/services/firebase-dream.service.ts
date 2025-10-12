import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, onSnapshot } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { FirebaseAuthService, UserProfile } from './firebase-auth.service';
import { Dream, DreamsByDate, DreamStatistics } from '../models/dream.model';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDreamService {
  private readonly DREAMS_COLLECTION = 'dreams';
  private readonly AUDIO_FOLDER = 'audio';
  private readonly LOCAL_DREAMS_KEY = 'local_dreams_backup';

  private dreamsSubject = new BehaviorSubject<DreamsByDate>({});
  public dreams$ = this.dreamsSubject.asObservable();

  private syncStatusSubject = new BehaviorSubject<boolean>(false);
  public syncStatus$ = this.syncStatusSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: FirebaseAuthService
  ) {
    this.initializeDreamsSync();
  }

  private async initializeDreamsSync() {
    // Escuchar cambios en la autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.startRealtimeSync();
      } else {
        this.stopRealtimeSync();
      }
    });
  }

  private startRealtimeSync() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const dreamsRef = collection(this.firestore, this.DREAMS_COLLECTION);
    const userDreamsQuery = query(
      dreamsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    onSnapshot(userDreamsQuery, async (snapshot) => {
      try {
        const dreams: DreamsByDate = {};
        
        snapshot.forEach((doc) => {
          const dream = { id: doc.id, ...doc.data() } as Dream;
          const dateKey = dream.date;
          
          if (!dreams[dateKey]) {
            dreams[dateKey] = [];
          }
          dreams[dateKey].push(dream);
        });

        this.dreamsSubject.next(dreams);
        this.syncStatusSubject.next(true);
        
        // Guardar backup local
        await this.saveLocalBackup(dreams);
        
        console.log('Dreams synced from Firebase:', dreams);
      } catch (error) {
        console.error('Error syncing dreams:', error);
        this.syncStatusSubject.next(false);
      }
    });
  }

  private stopRealtimeSync() {
    // Limpiar suscripciones si es necesario
    this.dreamsSubject.next({});
    this.syncStatusSubject.next(false);
  }

  async addDream(dream: Omit<Dream, 'id' | 'createdAt' | 'userId'>): Promise<Dream> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const newDream: Omit<Dream, 'id'> = {
        ...dream,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      // Subir archivo de audio si existe
      if (dream.audioPath && dream.audioPath.startsWith('file://')) {
        newDream.audioPath = await this.uploadAudioFile(dream.audioPath, user.uid);
      }

      const docRef = await addDoc(collection(this.firestore, this.DREAMS_COLLECTION), newDream);
      const createdDream: Dream = { id: docRef.id, ...newDream };

      console.log('Dream added to Firebase:', createdDream);
      return createdDream;
    } catch (error) {
      console.error('Error adding dream to Firebase:', error);
      // Fallback: guardar localmente
      return this.addDreamLocally(dream);
    }
  }

  async updateDream(dreamId: string, updates: Partial<Dream>): Promise<Dream | null> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const dreamRef = doc(this.firestore, this.DREAMS_COLLECTION, dreamId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Subir nuevo archivo de audio si existe
      if (updates.audioPath && updates.audioPath.startsWith('file://')) {
        updateData.audioPath = await this.uploadAudioFile(updates.audioPath, user.uid);
      }

      await updateDoc(dreamRef, updateData);
      
      console.log('Dream updated in Firebase:', dreamId);
      return { id: dreamId, ...updates } as Dream;
    } catch (error) {
      console.error('Error updating dream in Firebase:', error);
      // Fallback: actualizar localmente
      return this.updateDreamLocally(dreamId, updates);
    }
  }

  async deleteDream(dreamId: string): Promise<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Obtener el sueño para eliminar el archivo de audio
      const dream = this.getDreamById(dreamId);
      if (dream && dream.audioPath && dream.audioPath.startsWith('https://')) {
        await this.deleteAudioFile(dream.audioPath);
      }

      const dreamRef = doc(this.firestore, this.DREAMS_COLLECTION, dreamId);
      await deleteDoc(dreamRef);
      
      console.log('Dream deleted from Firebase:', dreamId);
      return true;
    } catch (error) {
      console.error('Error deleting dream from Firebase:', error);
      // Fallback: eliminar localmente
      return this.deleteDreamLocally(dreamId);
    }
  }

  getDreamsByDate(date: string): Dream[] {
    const dreams = this.dreamsSubject.value;
    return dreams[date] || [];
  }

  getDreamById(dreamId: string): Dream | null {
    const dreams = this.dreamsSubject.value;

    for (const date in dreams) {
      const dream = dreams[date].find(d => d.id === dreamId);
      if (dream) {
        return dream;
      }
    }

    return null;
  }

  getAllDreams(): Dream[] {
    const dreams = this.dreamsSubject.value;
    const allDreams: Dream[] = [];

    for (const date in dreams) {
      allDreams.push(...dreams[date]);
    }

    return allDreams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getDreamStatistics(): DreamStatistics {
    const allDreams = this.getAllDreams();
    const goodDreams = allDreams.filter(dream => dream.type === 'good').length;
    const badDreams = allDreams.filter(dream => dream.type === 'bad').length;
    const streakDays = this.calculateStreakDays();

    return {
      streakDays,
      totalDreams: allDreams.length,
      goodDreams,
      badDreams
    };
  }

  hasDreams(date: string): boolean {
    const dreams = this.dreamsSubject.value;
    return !!(dreams[date] && dreams[date].length > 0);
  }

  async exportDreams(): Promise<string> {
    const dreams = this.dreamsSubject.value;
    return JSON.stringify(dreams, null, 2);
  }

  async clearAllData(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      // Eliminar todos los sueños de Firebase
      const dreamsRef = collection(this.firestore, this.DREAMS_COLLECTION);
      const userDreamsQuery = query(dreamsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(userDreamsQuery);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Limpiar backup local
      await Preferences.remove({ key: this.LOCAL_DREAMS_KEY });
      
      this.dreamsSubject.next({});
      console.log('All dreams cleared from Firebase');
    } catch (error) {
      console.error('Error clearing dreams:', error);
    }
  }

  // Métodos de respaldo local
  private async addDreamLocally(dream: Omit<Dream, 'id' | 'createdAt' | 'userId'>): Promise<Dream> {
    const newDream: Dream = {
      ...dream,
      id: this.generateId(),
      userId: 'local',
      createdAt: new Date().toISOString()
    };

    const currentDreams = this.dreamsSubject.value;
    const dateKey = dream.date;

    if (!currentDreams[dateKey]) {
      currentDreams[dateKey] = [];
    }

    currentDreams[dateKey].push(newDream);
    await this.saveLocalBackup(currentDreams);
    this.dreamsSubject.next(currentDreams);

    return newDream;
  }

  private async updateDreamLocally(dreamId: string, updates: Partial<Dream>): Promise<Dream | null> {
    const currentDreams = this.dreamsSubject.value;

    for (const date in currentDreams) {
      const dreamIndex = currentDreams[date].findIndex(d => d.id === dreamId);
      if (dreamIndex !== -1) {
        currentDreams[date][dreamIndex] = {
          ...currentDreams[date][dreamIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await this.saveLocalBackup(currentDreams);
        this.dreamsSubject.next(currentDreams);
        return currentDreams[date][dreamIndex];
      }
    }

    return null;
  }

  private async deleteDreamLocally(dreamId: string): Promise<boolean> {
    const currentDreams = this.dreamsSubject.value;

    for (const date in currentDreams) {
      const dreamIndex = currentDreams[date].findIndex(d => d.id === dreamId);
      if (dreamIndex !== -1) {
        currentDreams[date].splice(dreamIndex, 1);

        if (currentDreams[date].length === 0) {
          delete currentDreams[date];
        }

        await this.saveLocalBackup(currentDreams);
        this.dreamsSubject.next(currentDreams);
        return true;
      }
    }

    return false;
  }

  private async saveLocalBackup(dreams: DreamsByDate): Promise<void> {
    try {
      await Preferences.set({
        key: this.LOCAL_DREAMS_KEY,
        value: JSON.stringify(dreams)
      });
    } catch (error) {
      console.error('Error saving local backup:', error);
    }
  }

  private async loadLocalBackup(): Promise<DreamsByDate> {
    try {
      const { value } = await Preferences.get({ key: this.LOCAL_DREAMS_KEY });
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error loading local backup:', error);
      return {};
    }
  }

  // Métodos para archivos de audio
  private async uploadAudioFile(audioPath: string, userId: string): Promise<string> {
    try {
      // Convertir file:// a blob
      const response = await fetch(audioPath);
      const blob = await response.blob();
      
      const fileName = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;
      const audioRef = ref(this.storage, `${this.AUDIO_FOLDER}/${userId}/${fileName}`);
      
      const snapshot = await uploadBytes(audioRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Audio file uploaded:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw error;
    }
  }

  private async deleteAudioFile(audioUrl: string): Promise<void> {
    try {
      const audioRef = ref(this.storage, audioUrl);
      await deleteObject(audioRef);
      console.log('Audio file deleted:', audioUrl);
    } catch (error) {
      console.error('Error deleting audio file:', error);
    }
  }

  private calculateStreakDays(): number {
    const dreams = this.dreamsSubject.value;
    const dates = Object.keys(dreams)
      .filter(date => dreams[date].length > 0)
      .sort()
      .reverse();

    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const todayStr = this.formatDateToString(today);

    const latestDate = dates[0];
    const daysDiff = this.getDaysDifference(latestDate, todayStr);

    if (daysDiff > 1) {
      return 0;
    }

    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];
      const expectedDate = this.subtractDays(todayStr, streak);

      if (currentDate === expectedDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private formatDateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private subtractDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - days);
    return this.formatDateToString(date);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
