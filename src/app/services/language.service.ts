import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  public readonly languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  constructor() {
    this.loadLanguage();
  }

  private async loadLanguage() {
    try {
      const { value } = await Preferences.get({ key: 'app_language' });
      if (value) {
        this.currentLanguageSubject.next(value);
      } else {
        // Default to browser language or English
        const browserLang = navigator.language.split('-')[0];
        const supportedLang = this.languages.find(lang => lang.code === browserLang);
        this.currentLanguageSubject.next(supportedLang ? browserLang : 'en');
      }
    } catch (error) {
      console.error('Error loading language:', error);
      this.currentLanguageSubject.next('en');
    }
  }

  async setLanguage(languageCode: string) {
    try {
      await Preferences.set({
        key: 'app_language',
        value: languageCode
      });
      this.currentLanguageSubject.next(languageCode);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  getLanguageByCode(code: string): Language | undefined {
    return this.languages.find(lang => lang.code === code);
  }
}
