#!/usr/bin/env python3
"""
SolveCraft Audio Generator & Video Muxer
Generates:
1. Studio voiceover narration for all 5 scenes using macOS speech synthesis (Samantha).
2. Sound FX: High-tech whooshes, camera shutter snap, solution chime.
3. Ambient modern electronic synth track for social media energy.
4. Muxes audio with solvecraft_promo_reel_9x16.mp4 into solvecraft_promo_reel_9x16.mp4 (overwriting with full AV sync).
"""

import math
import os
import struct
import subprocess
import sys
import wave
import numpy as np

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_RATE = 44100
TOTAL_DURATION = 21.0  # seconds
TOTAL_SAMPLES = int(TOTAL_DURATION * SAMPLE_RATE)

# Path to ffmpeg
try:
    import imageio_ffmpeg
    FFMPEG_BIN = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_BIN = "ffmpeg"

def generate_voiceovers():
    """Generate high quality narration audio clips for each scene."""
    voice_clips = [
        # (filename, text, start_time_sec)
        ("vo_scene1.aiff", "Stuck on homework? Math and science got you stumped?", 0.6),
        ("vo_scene2.aiff", "Just snap and solve with SolveCraft.", 4.2),
        ("vo_scene3.aiff", "Get instant, step-by-step AI breakdowns that actually teach you the concept.", 8.8),
        ("vo_scene4.aiff", "From algebra to chemistry, master STEM with complete confidence.", 13.8),
        ("vo_scene5.aiff", "Download SolveCraft free today on Google Play.", 17.5),
    ]

    converted_clips = []
    for fname, text, start_time in voice_clips:
        aiff_path = os.path.join("/tmp", fname)
        wav_path = os.path.join("/tmp", fname.replace(".aiff", ".wav"))
        
        # Use Samantha voice at conversational 180 wpm
        subprocess.run(["say", "-v", "Samantha", "-r", "180", "-o", aiff_path, text], check=True)
        # Convert to 44.1kHz stereo WAV
        subprocess.run([
            FFMPEG_BIN, "-y", "-i", aiff_path,
            "-ar", str(SAMPLE_RATE), "-ac", "2",
            wav_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        converted_clips.append((wav_path, start_time))
    
    return converted_clips

def load_wav_as_numpy(wav_path):
    with wave.open(wav_path, "rb") as wf:
        n_channels = wf.getnchannels()
        n_frames = wf.getnframes()
        data = wf.readframes(n_frames)
        audio = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
        if n_channels == 1:
            audio = np.column_stack((audio, audio))
        elif n_channels == 2:
            audio = audio.reshape(-1, 2)
        return audio

def synth_whoosh(duration=0.4):
    """Generate a clean whoosh sound effect."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    freq = np.linspace(400, 90, n)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    env = np.sin(np.pi * t / duration) ** 2
    # Add subtle pink noise
    noise = np.random.randn(n) * 0.15
    tone = (np.sin(phase) * 0.4 + noise) * env
    return np.column_stack((tone, tone))

def synth_shutter(duration=0.15):
    """Generate a crisp camera shutter click."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    noise = np.random.randn(n) * np.exp(-t * 35)
    click = np.sin(2 * np.pi * 900 * t) * np.exp(-t * 50) * 0.6
    combined = (noise * 0.5 + click) * 0.6
    return np.column_stack((combined, combined))

def synth_chime(freqs=[523.25, 659.25, 783.99, 1046.50], duration=0.8):
    """Generate an elegant harmonic chime."""
    n = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, n)
    env = np.exp(-t * 4.5)
    wave_data = np.zeros(n)
    for i, f in enumerate(freqs):
        delay = i * 0.05
        mask = t >= delay
        sub_t = t[mask] - delay
        sub_env = np.exp(-sub_t * 5.0)
        wave_data[mask] += np.sin(2 * np.pi * f * sub_t) * sub_env * (0.8 ** i)
    wave_data = wave_data * 0.35
    return np.column_stack((wave_data, wave_data))

def synth_background_music(total_seconds):
    """
    Generate an ambient, modern upbeat electronic synth track:
    - Warm chord progression (Cmaj7 -> Am9 -> Fmaj7 -> Gsus4)
    - Subtle melodic pulses and soft sub-bass to create rhythmic drive without overpowering voiceover.
    """
    n = int(SAMPLE_RATE * total_seconds)
    t = np.linspace(0, total_seconds, n)
    music = np.zeros((n, 2))

    bpm = 110
    sec_per_beat = 60.0 / bpm
    bar_sec = sec_per_beat * 4

    # Chords in Hz (Root, 3rd, 5th, 7th)
    chords = [
        [130.81, 164.81, 196.00, 246.94],  # Cmaj7
        [110.00, 130.81, 164.81, 220.00],  # Am7
        [87.31, 130.81, 174.61, 220.00],   # Fmaj7
        [98.00, 146.83, 196.00, 261.63],   # G
    ]

    for bar_idx in range(int(total_seconds / bar_sec) + 1):
        chord = chords[bar_idx % len(chords)]
        bar_start = bar_idx * bar_sec
        bar_end = min(total_seconds, bar_start + bar_sec)
        
        start_idx = int(bar_start * SAMPLE_RATE)
        end_idx = int(bar_end * SAMPLE_RATE)
        if start_idx >= n:
            break
        
        sub_t = t[start_idx:end_idx] - bar_start
        chord_len = len(sub_t)
        
        # Soft pad sound with lowpass filtered harmonics
        pad_signal = np.zeros(chord_len)
        for freq in chord:
            pad_signal += np.sin(2 * np.pi * freq * sub_t) * 0.08
            pad_signal += np.sin(2 * np.pi * (freq * 2) * sub_t) * 0.03
        
        # Envelope with smooth attack and release
        attack = 0.4
        release = 0.4
        env = np.ones(chord_len)
        att_samples = int(attack * SAMPLE_RATE)
        rel_samples = int(release * SAMPLE_RATE)
        if att_samples < chord_len:
            env[:att_samples] = np.linspace(0, 1, att_samples)
        if rel_samples < chord_len:
            env[-rel_samples:] = np.linspace(1, 0, rel_samples)
            
        pad_signal = pad_signal * env
        
        # Add rhythmic pulse on beats 1, 2, 3, 4
        pulse_signal = np.zeros(chord_len)
        for beat in range(4):
            beat_time = beat * sec_per_beat
            if beat_time < (bar_end - bar_start):
                b_idx = int(beat_time * SAMPLE_RATE)
                pulse_dur = int(sec_per_beat * 0.7 * SAMPLE_RATE)
                p_end = min(chord_len, b_idx + pulse_dur)
                if p_end > b_idx:
                    p_t = np.linspace(0, (p_end - b_idx) / SAMPLE_RATE, p_end - b_idx)
                    p_env = np.exp(-p_t * 6.0)
                    pulse_signal[b_idx:p_end] += (
                        np.sin(2 * np.pi * chord[0] * 2 * p_t) * 0.06 +
                        np.sin(2 * np.pi * 55.0 * p_t) * 0.08  # subtle sub-bass
                    ) * p_env

        music[start_idx:end_idx, 0] += (pad_signal + pulse_signal)
        music[start_idx:end_idx, 1] += (pad_signal + pulse_signal)

    # Fade in / fade out music
    fade_in = int(1.0 * SAMPLE_RATE)
    fade_out = int(2.5 * SAMPLE_RATE)
    music[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    music[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]

    return music * 0.55  # Keep pleasant background volume

def compose_master_audio():
    print("🎙️ Generating studio voiceover narration...")
    voice_clips = generate_voiceovers()

    master = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float32)

    # 1. Add Background Music
    print("🎵 Synthesizing background music...")
    bgm = synth_background_music(TOTAL_DURATION)
    master += bgm[:TOTAL_SAMPLES]

    # 2. Add Sound FX cues
    print("💥 Adding SFX cues (whoosh, shutter, chimes)...")
    sfx_cues = [
        (synth_whoosh(0.35), 0.1, 0.4),
        (synth_whoosh(0.35), 4.0, 0.4),
        (synth_shutter(0.18), 7.1, 0.7),  # Camera shutter snap
        (synth_whoosh(0.35), 8.5, 0.4),
        (synth_chime([523.25, 659.25, 783.99], 0.8), 11.2, 0.5),  # Solution chime
        (synth_whoosh(0.35), 13.5, 0.4),
        (synth_whoosh(0.35), 17.0, 0.4),
        (synth_chime([659.25, 830.61, 987.77, 1318.5], 1.2), 17.3, 0.6), # CTA grand chime
    ]

    for sfx_data, at_time, vol in sfx_cues:
        start_idx = int(at_time * SAMPLE_RATE)
        end_idx = min(TOTAL_SAMPLES, start_idx + len(sfx_data))
        length = end_idx - start_idx
        if length > 0:
            master[start_idx:end_idx] += sfx_data[:length] * vol

    # 3. Layer Voiceover Narration with subtle ducking
    print("🗣️ Mixing voiceover clips with audio ducking...")
    for wav_file, start_time in voice_clips:
        vo_audio = load_wav_as_numpy(wav_file)
        start_idx = int(start_time * SAMPLE_RATE)
        end_idx = min(TOTAL_SAMPLES, start_idx + len(vo_audio))
        length = end_idx - start_idx
        
        if length > 0:
            # Duck BGM slightly during speech
            duck_start = max(0, start_idx - int(0.15 * SAMPLE_RATE))
            duck_end = min(TOTAL_SAMPLES, end_idx + int(0.25 * SAMPLE_RATE))
            master[duck_start:duck_end] *= 0.65  # lower BGM under voice
            
            # Place voice with full clarity
            master[start_idx:end_idx] += vo_audio[:length] * 1.35

    # Master Limiter / Normalization
    peak = np.max(np.abs(master))
    if peak > 0.95:
        master = (master / peak) * 0.95

    # Export to WAV
    output_wav = os.path.join("/tmp", "solvecraft_master_audio.wav")
    master_int16 = (master * 32767.0).astype(np.int16)
    with wave.open(output_wav, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(master_int16.tobytes())

    print(f"✅ Master audio created at {output_wav}")
    return output_wav

def mux_video_and_audio(wav_path):
    input_video = os.path.join(WORKSPACE_DIR, "solvecraft_promo_reel_9x16.mp4")
    temp_output = os.path.join(WORKSPACE_DIR, "solvecraft_promo_with_audio_temp.mp4")
    
    print(f"🎬 Muxing audio into video: {input_video}...")
    cmd = [
        FFMPEG_BIN, "-y",
        "-i", input_video,
        "-i", wav_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        temp_output
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True)

    # Replace original file with the audio-enabled video
    os.replace(temp_output, input_video)
    
    # Also update the artifact copy
    artifact_mp4 = "/Users/girishksankaran/.gemini/antigravity-ide/brain/b1ec872e-e648-4271-89ab-5f909c1c151b/solvecraft_promo_reel_9x16.mp4"
    subprocess.run(["cp", input_video, artifact_mp4], check=True)

    file_size_mb = os.path.getsize(input_video) / (1024 * 1024)
    print(f"🎉 SUCCESS! Final video with full narration & audio:")
    print(f"   Path: {input_video}")
    print(f"   Size: {file_size_mb:.2f} MB")

def main():
    wav_path = compose_master_audio()
    mux_video_and_audio(wav_path)

if __name__ == "__main__":
    main()
