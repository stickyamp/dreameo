import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { GenericResponse, RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioService {
  constructor(private alertController: AlertController) { }

  private isListeningSubject = new BehaviorSubject<boolean>(false);
  public isListening$ = this.isListeningSubject.asObservable();

  isListening = false;
  transcript = '';
  private recognitionResults: string[] = [];

  async toggleListening(): Promise<string> {
    if (!this.isListening) {
      return await this.startListening();
    } else {
      await this.stopListening();
      return "true";
    }
  }

  async startListening(): Promise<string> {
    try {
      // Check if speech recognition is available
      this.transcript = "";
      const available = await SpeechRecognition.available();
      if (!available) {
        console.warn('Reconocimiento de voz no disponible');
        await this.showAlert('Error', 'Reconocimiento de voz no disponible');
        return "false";
      }

      // Request permissions and wait for user confirmation
      const response = await SpeechRecognition.requestPermissions();

      // Check if permission was granted
      if (response.speechRecognition !== 'granted') {
        console.warn('Permisos de micrófono no concedidos');
        await this.showAlert('Error', 'Permisos de micrófono no concedidos');

        return "false";
      }

      this.isListeningSubject.next(true)

      // Start speech recognition
      const result = await SpeechRecognition.start({
        language: 'es-ES', //TODO CHANGE THIS SO IT ALSO GOES WITH ENGLISH,
        partialResults: false,
        prompt: 'Habla ahora...'
      });

      // Check if result is valid and has matches
      if (result && result.matches && Array.isArray(result.matches)) {
        this.transcript = result.matches[0] || '';
        this.recognitionResults = result.matches;
        console.log('Texto reconocido:', result.matches);
      } else {
        this.transcript = '';
        this.recognitionResults = [];
      }

      this.isListeningSubject.next(false)
      return this.transcript;
    } catch (error) {
      this.isListeningSubject.next(false)
      return this.transcript;
    }
  }

  async stopListening(): Promise<void> {
    try {
      await SpeechRecognition.stop();
      this.isListeningSubject.next(false)
      console.log('Grabación detenida');
    } catch (error) {
      console.error('Error al detener el reconocimiento de voz:', error);
      this.isListeningSubject.next(false)
    }
  }

  getTranscript(): string {
    return this.transcript;
  }

  getRecognitionResults(): string[] {
    return this.recognitionResults;
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
