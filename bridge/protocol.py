"""Bounded, timestamped read-only telemetry. This module has no ROS dependency."""
import json
import math
import threading
import time

SCHEMA_VERSION = 1
TOPICS = ('joint_states', 'objects', 'selected_info', 'task_status')
MAX_BYTES = 128 * 1024
MAX_AGE_MS = 2000


class TelemetryBuffer:
    def __init__(self):
        self._lock = threading.Lock()
        self._sequence = 0
        self._latest = {}

    def capture(self, topic, message, source_age_ms=0):
        if topic not in TOPICS or not isinstance(message, dict):
            return False
        if not isinstance(source_age_ms, (float, int)) or not math.isfinite(source_age_ms) or not 0 <= source_age_ms <= MAX_AGE_MS:
            return False
        try:
            payload = json.dumps(message, allow_nan=False, separators=(',', ':'))
        except (TypeError, ValueError):
            return False
        if len(payload.encode()) > MAX_BYTES:
            return False
        with self._lock:
            self._sequence += 1
            self._latest[topic] = (self._sequence, time.monotonic(), source_age_ms, json.loads(payload))
        return True

    def frames_after(self, sequence):
        now = time.monotonic()
        with self._lock:
            snapshot = list(self._latest.items())
        frames = []
        for topic, (seq, received, source_age, message) in snapshot:
            age = max(0, (now - received) * 1000 + source_age)
            if seq > sequence and age <= MAX_AGE_MS:
                frames.append({'schema_version': SCHEMA_VERSION, 'type': 'telemetry',
                               'topic': topic, 'sequence': seq, 'age_ms': round(age, 2),
                               'message': message})
        return sorted(frames, key=lambda f: f['sequence'])

    def snapshot(self):
        with self._lock:
            return {'sequence': self._sequence, 'cached_topics': sorted(self._latest)}
