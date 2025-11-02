import { BehaviorSubject, Observable } from "rxjs";
import {
  Dream,
  DreamsByDate,
  UserProfile,
  DreamStatistics,
  OfficialTags,
  TagModel,
} from "../../../models/dream.model";

export abstract class DreamService {
  protected dreamsSubject = new BehaviorSubject<DreamsByDate>({});
  public dreams$: Observable<DreamsByDate> = this.dreamsSubject.asObservable();

  protected tagsSubject = new BehaviorSubject<TagModel[]>([]);
  public tags$: Observable<TagModel[]> = this.tagsSubject.asObservable();

  protected userProfileSubject = new BehaviorSubject<UserProfile>({
    name: "Lucía",
    email: "lucia.sanchez@email.com",
    darkMode: true,
  });
  public userProfile$: Observable<UserProfile> =
    this.userProfileSubject.asObservable();
  abstract addDream(dream: Omit<Dream, "id" | "createdAt">): Promise<Dream>;
  abstract updateDream(
    dreamId: string,
    updates: Partial<Dream>
  ): Promise<Dream | null>;
  abstract deleteDream(dreamId: string): Promise<boolean>;
  abstract getDreamById(dreamId: string): Dream | null;
  abstract getDreamsByDate(date: string): Dream[];
  abstract getAllDreams(): Dream[];
  abstract hasDreams(date: string): boolean;

  abstract addTag(
    tagName: string,
    type: OfficialTags
  ): Promise<TagModel | void>;
  abstract deleteTag(tagName: string): Promise<boolean>;
  abstract getAllTags(): TagModel[];

  abstract updateUserProfile(profile: UserProfile): Promise<void>;
  abstract getDreamStatistics(): DreamStatistics;
  abstract clearAllData(): Promise<void>;

  abstract setAllDreamsOverwrite(dreams: Dream[]): void;
  abstract setAllTagsOverwrite(tags: TagModel[]): void;
}
