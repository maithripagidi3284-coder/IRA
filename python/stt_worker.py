import sys
import json
from vosk import Model, KaldiRecognizer

try:
    import vosk
    vosk.SetLogLevel(-1)
except Exception:
    pass

model_path = sys.argv[1]
wake_phrase = sys.argv[2] if len(sys.argv) > 2 else "hey ai"

commands = [
    "what have i missed",
    "what tasks have i missed",
    "what did i miss",
    "what is due today",
    "what tasks are due today",
    "what is upcoming",
    "list all",
    "list all tasks",
    "what have i completed",
    "what have i done",
]

full_phrases = [f"{wake_phrase} {c}" for c in commands]
print(f"DEBUG wake_phrase='{wake_phrase}'", file=sys.stderr, flush=True)
print(f"DEBUG full_phrases={full_phrases}", file=sys.stderr, flush=True)

grammar_list = full_phrases + [wake_phrase, "[unk]"]
grammar = json.dumps(grammar_list)

model = Model(model_path)
recognizer = KaldiRecognizer(model, 16000, grammar)

already_sent = False

while True:
    data = sys.stdin.buffer.read(8000)
    if len(data) == 0:
        break

    if recognizer.AcceptWaveform(data):
        result = json.loads(recognizer.Result())
        text = result.get("text", "").strip()

        if text and text != "[unk]" and not already_sent:
            print(json.dumps({"type": "final", "text": text}), flush=True)

        recognizer.Reset()
        already_sent = False
    else:
        partial = json.loads(recognizer.PartialResult())
        ptext = partial.get("partial", "").strip()

        if ptext:
            print(json.dumps({"type": "partial", "text": ptext}), flush=True)

            # The moment the live partial exactly matches one of our known
            # full command phrases, we know it's correct - act immediately,
            # don't wait for Vosk's own (unreliable) endpoint detection.
            if ptext in full_phrases and not already_sent:
                print(json.dumps({"type": "final", "text": ptext}), flush=True)
                already_sent = True