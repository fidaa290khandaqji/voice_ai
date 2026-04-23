const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

async function transcribeAudio(audioBuffer) {
  const request = {
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'ar-PS', // Palestinian Arabic
    },
  };

  const [response] = await speechClient.recognize(request);
  return response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
}

async function synthesizeSpeech(text) {
  const request = {
    input: { text },
    voice: { languageCode: 'ar-XA', ssmlGender: 'FEMALE' }, // Standard Arabic Female
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  return response.audioContent;
}

module.exports = { transcribeAudio, synthesizeSpeech };
