import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { ToastNotifierService, ToastLevelEnum } from "../toast-notifier";
import {
  Dream,
  DreamsByDate,
  UserProfile,
  DreamStatistics,
  OfficialTags,
  TagModel,
} from "../../../models/dream.model";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { DreamService } from "./dream.base.service";
import { LoggerService } from "../log.service";
import { FirebaseBackupService } from "../firebase-backup.service";

@Injectable()
export class DreamMobileService extends DreamService {
  private toastNotifierService: ToastNotifierService =
    inject(ToastNotifierService);
  private firebaseBackUpService: FirebaseBackupService = inject(
    FirebaseBackupService
  );
  private loggerService = inject(LoggerService);
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;

  private readonly MAX_ALLOWED_TAGS = 10;

  constructor() {
    super();
    this.loggerService.log(`Initting mobile dream service`);
    this.initDB().then(() => {
      this.loadDreams();
      this.loadTags();
      this.loadUserProfile();
    });
  }

  /** 🔧 Initialize SQLite DB and tables */
  private async initDB() {
    try {
      this.db = await this.sqlite.createConnection(
        "dreams_db",
        false,
        "no-encryption",
        1,
        false
      );
      await this.db.open();

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS dreams (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT,
          description TEXT,
          date TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          tags TEXT,
          isLucid INTEGER DEFAULT 0,
          isNightmare INTEGER DEFAULT 0
        );
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT UNIQUE,
          type TEXT
        );
      `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS user_profile (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT
        );
      `);
    } catch (err) {
      this.loggerService.log(`Error initializing DB ${err}`);
      console.error("Error initializing DB:", err);
    }
  }

  /** 🌙 DREAMS */
  private async loadDreams() {
    const result = await this.db.query("SELECT * FROM dreams;");
    const rows = result.values ?? [];
    const dreamsByDate: DreamsByDate = {};

    rows.forEach((d: any) => {
      const dream: Dream = {
        id: d.id,
        title: d.title,
        description: d.description,
        date: d.date,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        tags: d.tags ? JSON.parse(d.tags) : [],
        isLucid: !!d.isLucid,
        isNightmare: !!d.isNightmare,
      };
      if (!dreamsByDate[d.date]) dreamsByDate[d.date] = [];
      dreamsByDate[d.date].push(dream);
    });

    this.dreamsSubject.next(dreamsByDate);
  }

  async addDream(dream: Omit<Dream, "id" | "createdAt">): Promise<Dream> {
    try {
      const newDream: Dream = {
        ...dream,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
      };

      await this.db.run(
        `INSERT INTO dreams (id, title, description, date, createdAt, tags, isLucid, isNightmare)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newDream.id,
          newDream.title,
          newDream.description,
          newDream.date,
          newDream.createdAt,
          JSON.stringify(newDream.tags || []),
          newDream.isLucid ? 1 : 0,
          newDream.isNightmare ? 1 : 0,
        ]
      );

      await this.loadDreams();

      return newDream;
    } catch (err) {
      this.loggerService.log(`Error initializing DB ${err}`);
      return {} as Dream;
    }
  }

  async addDreams(dreams: Omit<Dream, "id" | "createdAt">[]): Promise<Dream[]> {
    try {
      if (!dreams?.length) return [];

      const newDreams: Dream[] = dreams.map((dream) => ({
        ...dream,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
      }));

      const statements = newDreams.map((dream) => ({
        statement: `INSERT INTO dreams (id, title, description, date, createdAt, tags, isLucid, isNightmare)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        values: [
          dream.id,
          dream.title,
          dream.description,
          dream.date,
          dream.createdAt,
          JSON.stringify(dream.tags || []),
          dream.isLucid ? 1 : 0,
          dream.isNightmare ? 1 : 0,
        ],
      }));

      // This runs all inserts inside a single transaction automatically
      await this.db.executeSet(statements);

      await this.loadDreams();

      return newDreams;
    } catch (err) {
      this.loggerService.log(`Error adding multiple dreams: ${err}`);
      return [];
    }
  }

  async addTags(tags: Omit<TagModel, "id">[]): Promise<TagModel[]> {
    try {
      if (!tags?.length) return [];

      const newTags: TagModel[] = tags.map((tag) => ({
        ...tag,
        id: this.generateId(),
      }));

      const statements = newTags.map((tag) => ({
        statement: `INSERT INTO tags (id, name, type) VALUES (?, ?, ?);`,
        values: [tag.id, tag.name, tag.type],
      }));

      // Execute all inserts as a single batch
      await this.db.executeSet(statements);

      await this.loadTags();

      return newTags;
    } catch (err) {
      this.loggerService.log(`Error adding multiple tags: ${err}`);
      return [];
    }
  }

  async updateDream(
    dreamId: string,
    updates: Partial<Dream>
  ): Promise<Dream | null> {
    const existing = this.getDreamById(dreamId);
    if (!existing) return null;

    const updatedDream: Dream = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.db.run(
      `UPDATE dreams
       SET title=?, description=?, date=?, updatedAt=?, tags=?, isLucid=?, isNightmare=?
       WHERE id=?;`,
      [
        updatedDream.title,
        updatedDream.description,
        updatedDream.date,
        updatedDream.updatedAt,
        JSON.stringify(updatedDream.tags || []),
        updatedDream.isLucid ? 1 : 0,
        updatedDream.isNightmare ? 1 : 0,
        dreamId,
      ]
    );

    await this.loadDreams();
    return updatedDream;
  }

  async deleteDream(dreamId: string): Promise<boolean> {
    await this.db.run(`DELETE FROM dreams WHERE id=?;`, [dreamId]);
    await this.loadDreams();
    return true;
  }

  getDreamById(dreamId: string): Dream | null {
    const all = this.getAllDreams();
    return all.find((d) => d.id === dreamId) || null;
  }

  getDreamsByDate(date: string): Dream[] {
    return this.dreamsSubject.value[date] || [];
  }

  getAllDreams(): Dream[] {
    const allDreams: Dream[] = [];
    Object.values(this.dreamsSubject.value).forEach((dreams) =>
      allDreams.push(...dreams)
    );
    return allDreams.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /** 🧩 TAGS */
  private async loadTags() {
    const result = await this.db.query("SELECT * FROM tags;");
    const tags =
      result.values?.map((t: any) => ({
        id: t.id,
        name: t.name,
        type: t.type,
      })) ?? [];
    this.tagsSubject.next(tags);
  }

  async addTag(tagName: string, type: OfficialTags) {
    const currentTags = this.tagsSubject.value;
    if (currentTags.length >= this.MAX_ALLOWED_TAGS) {
      this.toastNotifierService.presentToast(
        "Max number of tags reached.",
        ToastLevelEnum.ERROR,
        "bottom"
      );
      return;
    }
    if (currentTags.some((t) => t.name === tagName)) {
      this.toastNotifierService.presentToast(
        "Tag already exists",
        ToastLevelEnum.ERROR,
        "bottom"
      );
      return;
    }

    const newTag: TagModel = { id: this.generateId(), name: tagName, type };
    await this.db.run("INSERT INTO tags (id, name, type) VALUES (?, ?, ?);", [
      newTag.id,
      newTag.name,
      newTag.type,
    ]);
    await this.loadTags();
    return newTag;
  }

  async deleteTag(tagName: string): Promise<boolean> {
    await this.db.run("DELETE FROM tags WHERE name=?;", [tagName]);
    await this.loadTags();
    return true;
  }

  getAllTags(): TagModel[] {
    return this.tagsSubject.value;
  }

  /** 👤 USER PROFILE */
  private async loadUserProfile() {
    const result = await this.db.query("SELECT * FROM user_profile;");
    if (result.values?.length) {
      const profileData = Object.fromEntries(
        result.values.map((v: any) => [v.key, JSON.parse(v.value)])
      );
      this.userProfileSubject.next(profileData as UserProfile);
    }
  }

  async updateUserProfile(profile: UserProfile) {
    for (const [key, value] of Object.entries(profile)) {
      await this.db.run(
        `INSERT OR REPLACE INTO user_profile (key, value) VALUES (?, ?);`,
        [key, JSON.stringify(value)]
      );
    }
    this.userProfileSubject.next(profile);
  }

  /** 📊 STATS + HELPERS */
  getDreamStatistics(): DreamStatistics {
    const all = this.getAllDreams();
    const lucidDreams = all.filter((d) => d.isLucid).length;
    const nightmareDreams = all.filter((d) => d.isNightmare).length;
    return {
      totalDreams: all.length,
      goodDreams: all.length - nightmareDreams,
      badDreams: nightmareDreams,
      streakDays: this.calculateStreakDays(),
      lucidDreams,
    } as DreamStatistics;
  }

  private calculateStreakDays(): number {
    const dates = Object.keys(this.dreamsSubject.value).sort().reverse();
    if (dates.length === 0) return 0;

    let streak = 0;
    const today = this.formatDate(new Date());
    const diff = this.getDaysDiff(dates[0], today);
    if (diff > 1) return 0;

    for (let i = 0; i < dates.length; i++) {
      const expected = this.subtractDays(today, streak);
      if (dates[i] === expected) streak++;
      else break;
    }
    return streak;
  }

  private formatDate(d: Date) {
    return d.toISOString().split("T")[0];
  }

  private subtractDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - days);
    return this.formatDate(d);
  }

  private getDaysDiff(d1: string, d2: string): number {
    return Math.abs((+new Date(d2) - +new Date(d1)) / 86400000);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /** 📅 Check if a specific date has dreams */
  hasDreams(date: string): boolean {
    // Try to find dreams already loaded in memory first
    const dreamsForDate = this.dreamsSubject.value[date];
    if (dreamsForDate && dreamsForDate.length > 0) {
      return true;
    }
    return false;
  }

  /** 🧹 Clear all app data: dreams, tags, and user profile */
  async clearDreamsDB(): Promise<void> {
    try {
      await this.db.execute("DELETE FROM dreams;");
    } catch (err) {
      console.error(err);
    }
  }

  /** 🧹 Clear all app data: dreams, tags, and user profile */
  async clearTagsDB(): Promise<void> {
    try {
      await this.db.execute("DELETE FROM tags;");
    } catch (err) {
      console.error(err);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await this.db.execute("DELETE FROM dreams;");
      await this.db.execute("DELETE FROM tags;");
      await this.db.execute("DELETE FROM user_profile;");

      // Reset BehaviorSubjects
      this.dreamsSubject.next({});
      this.tagsSubject.next([]);
      this.userProfileSubject.next({
        name: "Lucía",
        email: "lucia.sanchez@email.com",
        darkMode: true,
      });

      this.toastNotifierService.presentToast(
        "All data cleared successfully.",
        ToastLevelEnum.INFO,
        "bottom"
      );
    } catch (err) {
      console.error("Error clearing data:", err);
      this.toastNotifierService.presentToast(
        "Failed to clear data.",
        ToastLevelEnum.ERROR,
        "bottom"
      );
    }
  }

  async setAllDreamsOverwrite(dreams: Dream[]): Promise<void> {
    if (!dreams || dreams.length <= 0) return;
    await this.clearDreamsDB();
    await this.addDreams(dreams);
  }

  async setAllTagsOverwrite(tags: TagModel[]): Promise<void> {
    if (!tags || tags.length <= 0) return;
    await this.clearTagsDB();
    await this.addTags(tags);
  }

  mapDreamsByDate(dreams: Dream[]): DreamsByDate {
    return dreams.reduce((acc: DreamsByDate, dream: Dream) => {
      const date = dream.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(dream);
      return acc;
    }, {});
  }
}
