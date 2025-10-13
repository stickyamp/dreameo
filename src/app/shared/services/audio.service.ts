import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { GenericResponse, RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

@Injectable({ providedIn: 'root' })
export class AudioService {

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

  async toggleListening() {
    if (!this.isListening) {
      await this.startListening();
    } else {
      await this.stopListening();
    }
  }

  async startListening() {
    const available = await SpeechRecognition.available();
    if (!available) {
      console.warn('Reconocimiento de voz no disponible');
      return;
    }

    await SpeechRecognition.requestPermissions();
    this.isListening = true;

    // Inicia el reconocimiento
    const { matches } = await SpeechRecognition.start({
      language: 'es-ES',
      partialResults: true
    });

    // Algunos dispositivos devuelven resultados al finalizar
    this.transcript = matches?.[0] || '';
    console.log('Texto reconocido:', matches);
  }

  async stopListening() {
    await SpeechRecognition.stop();
    this.isListening = false;
    console.log('Grabación detenida');
  }
}
