import { inject, Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Dream, DreamsByDate, UserProfile, DreamStatistics, OfficialTags, TagElement, TagModel } from '../../../models/dream.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastLevelEnum, ToastNotifierService } from '../toast-notifier';
import { DreamService } from './dream.base.service';
import { LoggerService } from '../log.service';

@Injectable()
export class DreamWebService extends DreamService {
  private toastNotifierService: ToastNotifierService = inject(ToastNotifierService);
  private loggerService = inject(LoggerService);

  private readonly DREAMS_KEY = 'dreams';
  private readonly TAGS_KEY = 'tags';
  private readonly USER_PROFILE_KEY = 'user_profile';
  private readonly MAX_ALLOWED_TAGS = 10;

  constructor() {
    console.log("manuXX initting dream web");
    super();
    this.loggerService.log(`Initting web dream service`);
    this.loadDreams().catch(err => console.error('Error loading dreams:', err));
    this.loadTags().catch(err => console.error('Error loading tags:', err));
    this.loadUserProfile().catch(err => console.error('Error loading profile:', err));
  }

  private async loadDreams(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.DREAMS_KEY });
      if (value) {
        const dreams = JSON.parse(value) as DreamsByDate;
        console.log("manuXX Dreams", dreams);
        this.dreamsSubject.next(dreams);
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
    }
  }

  private async saveDreams(dreams: DreamsByDate): Promise<void> {
    try {
      await Preferences.set({
        key: this.DREAMS_KEY,
        value: JSON.stringify(dreams)
      });
      this.dreamsSubject.next(dreams);
    } catch (error) {
      console.error('Error saving dreams:', error);
    }
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.USER_PROFILE_KEY });
      if (value) {
        const profile = JSON.parse(value) as UserProfile;
        this.userProfileSubject.next(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async updateUserProfile(profile: UserProfile): Promise<void> {
    try {
      await Preferences.set({
        key: this.USER_PROFILE_KEY,
        value: JSON.stringify(profile)
      });
      this.userProfileSubject.next(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  async addDream(dream: Omit<Dream, 'id' | 'createdAt'>): Promise<Dream> {
    const newDream: Dream = {
      ...dream,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    const currentDreams = this.dreamsSubject.value;
    const dateKey = dream.date;

    if (!currentDreams[dateKey]) {
      currentDreams[dateKey] = [];
    }

    currentDreams[dateKey].push(newDream);
    await this.saveDreams(currentDreams);

    return newDream;
  }

  async updateDream(dreamId: string, updates: Partial<Dream>): Promise<Dream | null> {
    const currentDreams = this.dreamsSubject.value;

    for (const date in currentDreams) {
      const dreamIndex = currentDreams[date].findIndex(d => d.id === dreamId);
      if (dreamIndex !== -1) {
        currentDreams[date][dreamIndex] = {
          ...currentDreams[date][dreamIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await this.saveDreams(currentDreams);
        return currentDreams[date][dreamIndex];
      }
    }

    return null;
  }

  async deleteDream(dreamId: string): Promise<boolean> {
    const currentDreams = this.dreamsSubject.value;

    for (const date in currentDreams) {
      const dreamIndex = currentDreams[date].findIndex(d => d.id === dreamId);
      if (dreamIndex !== -1) {
        currentDreams[date].splice(dreamIndex, 1);

        // Remove date key if no dreams left for that date
        if (currentDreams[date].length === 0) {
          delete currentDreams[date];
        }

        await this.saveDreams(currentDreams);
        return true;
      }
    }

    return false;
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

  async exportDreams(): Promise<string> {
    const dreams = this.dreamsSubject.value;
    return JSON.stringify(dreams, null, 2);
  }

  async clearAllData(): Promise<void> {
    try {
      await Preferences.remove({ key: this.DREAMS_KEY });
      this.dreamsSubject.next({});
    } catch (error) {
      console.error('Error clearing dreams:', error);
    }
  }

  hasDreams(date: string): boolean {
    const dreams = this.dreamsSubject.value;
    return !!(dreams[date] && dreams[date].length > 0);
  }

  getDreamStatistics(): DreamStatistics {
    const allDreams = this.getAllDreams();
    const goodDreams = allDreams.filter(dream => dream.tags && dream.tags.some(tag => tag.type === OfficialTags.REGULAR)).length;
    const badDreams = allDreams.filter(dream => dream.tags && dream.tags.some(tag => tag.type === OfficialTags.NIGHTMARE)).length;
    const streakDays = this.calculateStreakDays();

    return {
      streakDays,
      totalDreams: allDreams.length,
      goodDreams,
      badDreams
    };
  }

  private calculateStreakDays(): number {
    const dreams = this.dreamsSubject.value;
    const dates = Object.keys(dreams)
      .filter(date => dreams[date].length > 0)
      .sort()
      .reverse(); // Más reciente primero

    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const todayStr = this.formatDateToString(today);

    // Verificar si hay sueño hoy o ayer
    const latestDate = dates[0];
    const daysDiff = this.getDaysDifference(latestDate, todayStr);

    if (daysDiff > 1) {
      return 0; // La racha se rompió
    }

    // Contar días consecutivos hacia atrás
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


  public async addTag(tagName: string, type: OfficialTags) {
    const newTag: TagModel = {
      id: this.generateId(),
      type: type,
      name: tagName
    };

    const currentTags = this.tagsSubject.value;

    if (currentTags.length > this.MAX_ALLOWED_TAGS) {
      this.toastNotifierService.presentToast("Max number of tags reached.", ToastLevelEnum.ERROR, "bottom");
      return;
    }

    if (currentTags.some(t => t.name == newTag.name)) {
      this.toastNotifierService.presentToast("Tag already exist", ToastLevelEnum.ERROR, "bottom");
      return;
    }

    currentTags.push(newTag);
    await this.saveTags(currentTags);

    return newTag;
  }

  private async saveTags(tags: TagModel[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.TAGS_KEY,
        value: JSON.stringify(tags)
      });
      this.tagsSubject.next(tags);
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  }

  private async loadTags(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.TAGS_KEY });
      if (value) {
        const tags = JSON.parse(value) as TagModel[];
        console.log("manuXX tags", tags);
        this.tagsSubject.next(tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }

  getAllTags(): TagModel[] {
    const tags = this.tagsSubject.value;
    return tags;
  }

  async deleteTag(tagName: string): Promise<boolean> {
    const currentTags = this.tagsSubject.value;

    if (!currentTags.find(ct => ct.name == tagName)) {
      return false;
    }

    const filteredTags = currentTags.filter(ct => ct.name != tagName);

    await this.saveTags(filteredTags);
    return true;
  }
}
