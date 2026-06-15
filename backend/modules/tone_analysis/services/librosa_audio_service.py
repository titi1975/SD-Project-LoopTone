import librosa
import numpy as np
from modules.tone_analysis.services.interfaces import IAudioAnalyzer
from shared.exceptions.base_exceptions import BusinessRuleException

class LibrosaAudioService(IAudioAnalyzer):
    def analyze_audio(self, file_path: str) -> dict:
        try:
            # 1. Pre-processamento
            y, sr = librosa.load(file_path, sr=44100, mono=True)
            y, _ = librosa.effects.trim(y)
            
            # 2. RMS e Normalização
            rms_original_mean = float(np.mean(librosa.feature.rms(y=y)[0]))
            y = librosa.util.normalize(y)
            rms_mean = float(np.mean(librosa.feature.rms(y=y)[0]))
            
            # 3. Extração de Features (A Matemática do Tom)
            flatness = float(np.mean(librosa.feature.spectral_flatness(y=y)[0]))
            centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)[0]))
            rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr)[0]))
            mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=5), axis=1).tolist()
            clipping_ratio = float(np.sum(np.abs(y) > 0.99) / len(y))
            
            # 4. Detecção de Anomalias (Áudio ruim)
            warnings = []
            if rms_original_mean < 0.02:
                warnings.append("O volume do áudio gravado está muito baixo. A análise pode ser imprecisa.")
            if clipping_ratio > 0.01:
                warnings.append("O áudio está 'clipando' (estourado/distorcido na interface digital). Diminua o ganho de entrada da sua placa de som.")

            return {
                "audio_quality": {
                    "warnings": warnings,
                    "input_volume": rms_original_mean,
                    "clipping": clipping_ratio
                },
                "tone_signature": {
                    "rms": rms_mean,
                    "flatness": flatness,
                    "centroid": centroid,
                    "rolloff": rolloff,
                    "mfcc": mfcc
                }
            }
        except Exception as e:
            raise BusinessRuleException(f"Falha ao processar a acústica do arquivo de áudio: {str(e)}")