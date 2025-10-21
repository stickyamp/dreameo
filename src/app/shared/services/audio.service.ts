import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { GenericResponse, RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { AlertController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class AudioService {
  constructor(private alertController: AlertController) { }
  private recording: boolean = false;

  // requestRecordingPermission(): Promise<GenericResponse> {
  //   return VoiceRecorder.requestAudioRecordingPermission();
  // }
  // async startRecording(): Promise<void> {
  //   if (this.recording) return;
  //   this.recording = true;
  //   VoiceRecorder.startRecording();
  // }

  // async stopRecording(): Promise<void> {
  //   if (!this.recording) return;
  //   this.recording = false;
  //   VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
  //     const recordedData = result.value.recordDataBase64;
  //     const fileName = new Date().getTime() + '.wav'
  //     await Filesystem.writeFile({
  //       path: fileName,
  //       directory: Directory.Data,
  //       data: recordedData ?? ''
  //     })
  //   });
  // }

  isListening = false;
  transcript = '';
  private recognitionResults: string[] = [];

  async toggleListening(): Promise<boolean> {
    if (!this.isListening) {
      return await this.startListening();
    } else {
      await this.stopListening();
      return true;
    }
  }

  async startListening(): Promise<boolean> {
    try {
      // Check if speech recognition is available
      const available = await SpeechRecognition.available();
      if (!available) {
        console.warn('Reconocimiento de voz no disponible');
        await this.showAlert('Error', 'Reconocimiento de voz no disponible');
        return false;
      }

      // Request permissions and wait for user confirmation
      const response = await SpeechRecognition.requestPermissions();

      // Check if permission was granted
      if (response.speechRecognition !== 'granted') {
        console.warn('Permisos de micrófono no concedidos');
        await this.showAlert('Error', 'Permisos de micrófono no concedidos');

        return false;
      }

      // Set listening state
      this.isListening = true;

      // Start speech recognition
      const result = await SpeechRecognition.start({
        language: 'es-ES',
        partialResults: true,
        prompt: 'Habla ahora...'
      });

      // Check if result is valid and has matches
      if (result && result.matches && Array.isArray(result.matches)) {
        this.transcript = result.matches[0] || '';
        this.recognitionResults = result.matches;
        console.log('Texto reconocido:', result.matches);
      } else {
        console.log('Speech recognition started but no immediate results');
        console.log('Result object:', result);
        this.transcript = '';
        this.recognitionResults = [];

        // On mobile, results might come through events, so we'll wait for them
        console.log('Waiting for speech recognition results...');
      }

      return true;
    } catch (error) {
      console.error('Error al iniciar el reconocimiento de voz:', error);
      await this.showAlert('Error', `Error al iniciar el reconocimiento de voz: ${error}`);
      this.isListening = false;
      return false;
    }
  }

  async stopListening(): Promise<void> {
    try {
      await SpeechRecognition.stop();
      this.isListening = false;
      console.log('Grabación detenida');
    } catch (error) {
      console.error('Error al detener el reconocimiento de voz:', error);
      this.isListening = false;
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
