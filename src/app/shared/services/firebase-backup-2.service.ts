import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "@angular/fire/firestore";
import { BehaviorSubject, Observable, from, throwError } from "rxjs";
import { map, catchError, switchMap } from "rxjs/operators";
import { FirebaseAuthService, UserProfile } from "./firebase-auth.service";
import { CrashlyticsService } from "./crashlytics.service";
import { LoggerService } from "./log.service";
import { getApp } from "firebase/app";
import { addDoc, arrayUnion, getFirestore } from "firebase/firestore";
import { Dream, TagModel } from "@/app/models/dream.model";
import { EncryptService } from "./encrypt.service";

export interface BackupItem<T = any> {
  id: string;
  userId: string;
  data: T;
  createdAt: string;
  updatedAt: string;
  syncStatus: "synced" | "pending" | "error";
}

export interface BackupMetadata {
  totalItems: number;
  lastBackupDate: string;
  lastSyncDate: string;
}

@Injectable({
  providedIn: "root",
})
export class FirebaseBackupService {
  private readonly COLLECTION_NAME = "userBackups"; // Change this to your collection name
  private backupItemsSubject = new BehaviorSubject<BackupItem[]>([]);
  public backupItems$ = this.backupItemsSubject.asObservable();

  private isSyncingSubject = new BehaviorSubject<boolean>(false);
  public isSyncing$ = this.isSyncingSubject.asObservable();

  private currentUser: UserProfile | null = null;

  constructor(
    private firestore: Firestore,
    private authService: FirebaseAuthService,
    private crashlytics: CrashlyticsService,
    private logService: LoggerService,
    private encryptService: EncryptService
  ) {
    this.initializeService();
  }

  private initializeService() {
    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.logService.log(`Backup service initialized for user: ${user.uid}`);
        // Automatically load backups when user logs in
        // this.loadAllBackups().subscribe({
        //   next: (items) => {
        //     this.logService.log(`Loaded ${items.length} backup items`);
        //   },
        //   error: (error) => {
        //     this.logService.log(`Error loading backups: ${error.message}`);
        //   },
        // });
      } else {
        // Clear backups when user logs out
        this.backupItemsSubject.next([]);
      }
    });
  }

  /**
   * Remove undefined values from an object (Firestore doesn't support undefined)
   * Also handles other Firestore restrictions
   */
  private cleanData<T>(data: T): any {
    if (data === null) {
      return null;
    }

    if (data === undefined) {
      return null; // Convert undefined to null for Firestore
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.cleanData(item));
    }

    if (data instanceof Date) {
      return data.toISOString(); // Convert dates to ISO strings
    }

    if (typeof data === "object") {
      const cleaned: any = {};
      Object.keys(data).forEach((key) => {
        const value = (data as any)[key];
        // Skip undefined values entirely
        if (value !== undefined) {
          cleaned[key] = this.cleanData(value);
        }
      });
      return cleaned;
    }

    return data;
  }

  private removeUndefined(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.removeUndefined(v));
    } else if (obj && typeof obj === "object") {
      const cleaned: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined) cleaned[key] = this.removeUndefined(value);
      });
      return cleaned;
    }
    return obj;
  }

  async saveAllDreams(dreams: Dream[]) {
    try {
      if (!this.currentUser?.uid) return;

      const encryptedDreams = dreams.map((d) => ({
        ...d,
        title: this.encryptService.encrypt(
          d.title,
          this.currentUser?.uid ?? ""
        ),
        description: this.encryptService.encrypt(
          d.description ?? "",
          this.currentUser?.uid ?? ""
        ),
      }));

      const ref = doc(this.firestore, "dreams", this.currentUser.uid);
      await setDoc(
        ref,
        { dreams: this.removeUndefined(encryptedDreams) },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
    }
  }

  async getAllDreams(): Promise<Dream[]> {
    try {
      if (!this.currentUser?.uid) return [];

      const ref = doc(this.firestore, "dreams", this.currentUser.uid);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const dreams = data["dreams"] || [];

        return dreams.map((d: Dream) => ({
          ...d,
          title: this.encryptService.decrypt(
            d.title,
            this.currentUser?.uid ?? ""
          ),
          description: this.encryptService.decrypt(
            d.description ?? "",
            this.currentUser?.uid ?? ""
          ),
        }));
      }

      return [];
    } catch (err) {
      console.error("Error fetching dreams:", err);
      return [];
    }
  }

  async saveAllTags(tags: TagModel[]) {
    try {
      if (!this.currentUser?.uid) return;
      const ref = doc(this.firestore, "dreams", this.currentUser.uid);
      await setDoc(ref, { tags: this.removeUndefined(tags) }, { merge: true });
      // using { merge: true } so it doesn’t overwrite `dreams`
    } catch (err) {
      console.error("Error saving tags:", err);
    }
  }

  async getAllTags(): Promise<TagModel[]> {
    console.log("loading tags currentUser", this.currentUser);
    try {
      if (!this.currentUser?.uid) return [];

      const ref = doc(this.firestore, "dreams", this.currentUser.uid);
      console.log("loading tags for user uid", this.currentUser.uid);

      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log("Tags loaded from Firestore:", data);
        return data["tags"] || [];
      } else {
        console.log("No tags found for this user.");
        return [];
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
      return [];
    }
  }
  /**
   * Get current backup items (synchronous)
   */
  getCurrentBackups<T>(): BackupItem<T>[] {
    return this.backupItemsSubject.value as BackupItem<T>[];
  }

  /**
   * Check if user has backups
   */
  hasBackups(): boolean {
    return this.backupItemsSubject.value.length > 0;
  }
}
