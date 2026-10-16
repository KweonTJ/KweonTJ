import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from protocol import TelemetryBuffer


class ProtocolTests(unittest.TestCase):
    def test_source_and_queued_age_are_preserved(self):
        buffer = TelemetryBuffer()
        with patch('protocol.time.monotonic', return_value=10):
            self.assertTrue(buffer.capture('joint_states', {'position': [1]}, 900))
        with patch('protocol.time.monotonic', return_value=10.5):
            frame = buffer.frames_after(-1)[0]
            self.assertEqual(frame['age_ms'], 1400)
        with patch('protocol.time.monotonic', return_value=12):
            self.assertEqual(buffer.frames_after(-1), [])

    def test_repeated_poll_does_not_refresh_or_resequence_old_data(self):
        buffer = TelemetryBuffer()
        buffer.capture('joint_states', {'position': [1]})
        first = buffer.frames_after(-1)[0]
        self.assertEqual(buffer.frames_after(first['sequence']), [])
        self.assertEqual(buffer.frames_after(-1)[0]['sequence'], first['sequence'])

    def test_only_latest_per_allowed_topic_is_retained(self):
        buffer = TelemetryBuffer()
        for i in range(500):
            buffer.capture('joint_states', {'position': [i]})
        buffer.capture('objects', {'data': '{}'})
        frames = buffer.frames_after(-1)
        self.assertEqual(len(frames), 2)
        self.assertEqual(frames[0]['message']['position'], [499])
        self.assertLess(frames[0]['sequence'], frames[1]['sequence'])
        self.assertFalse(buffer.capture('cmd_vel', {'linear': [1, 0, 0]}))

    def test_malformed_or_stale_data_is_rejected(self):
        buffer = TelemetryBuffer()
        for age in [-1, 2001, float('inf'), float('nan')]:
            self.assertFalse(buffer.capture('joint_states', {}, age))
        self.assertFalse(buffer.capture('joint_states', {'bad': float('nan')}))
        self.assertFalse(buffer.capture('joint_states', {'text': 'x' * 140000}))
        self.assertFalse(buffer.capture('joint_states', []))

    def test_source_message_is_snapshotted(self):
        buffer = TelemetryBuffer()
        msg = {'position': [1]}
        buffer.capture('joint_states', msg)
        msg['position'][0] = 2
        self.assertEqual(buffer.frames_after(-1)[0]['message']['position'], [1])


if __name__ == '__main__':
    unittest.main()
