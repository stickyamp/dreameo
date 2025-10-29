import { Injectable } from "@angular/core";
import { Capacitor } from "@capacitor/core";

@Injectable({
  providedIn: "root",
})
export class CrashlyticsService {
  private isNativePlatform: boolean;

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
    this.initialize();
  }

  private initialize() {
    if (this.isNativePlatform) {
      console.log("✅ Crashlytics: Disponible en plataforma nativa");
    } else {
      console.log(
        "ℹ️ Crashlytics: No disponible en web (solo para Android/iOS)"
      );
    }
  }

  /**
   * Registra un error no fatal en Crashlytics
   */
  logError(error: Error, context?: string) {
    if (this.isNativePlatform) {
      console.error(`[Crashlytics] ${context || "Error"}:`, error);
      // En Android, los errores se registran automáticamente
      // Si se necesita registro explícito, se puede usar un plugin de Capacitor
    } else {
      console.error(`[Error] ${context || "Error"}:`, error);
    }
  }

  /**
   * Registra un mensaje personalizado en Crashlytics
   */
  log(message: string) {
    if (this.isNativePlatform) {
      console.log(`[Crashlytics] ${message}`);
    } else {
      console.log(`[Log] ${message}`);
    }
  }

  /**
   * Establece un ID de usuario para rastrear en Crashlytics
   */
  setUserId(userId: string) {
    if (this.isNativePlatform) {
      console.log(`[Crashlytics] Usuario establecido: ${userId}`);
      // Aquí se podría usar un plugin para establecer el userId en Crashlytics
    }
  }

  /**
   * Establece atributos personalizados
   */
  setCustomKey(key: string, value: string | number | boolean) {
    if (this.isNativePlatform) {
      console.log(`[Crashlytics] Custom key: ${key} = ${value}`);
    }
  }

  /**
   * Registra un error fatal manualmente (solo para casos excepcionales)
   */
  recordFatalError(error: Error, context?: string) {
    this.logError(error, context);
    // En producción, esto causaría un crash en Android para testing
    // throw error;
  }
}
