import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from aiohttp import ClientSession, WSServerHandshakeError, WSMsgType
from aiohttp.test_utils import TestServer
from gateway import create_app, source_age_ms
from types import SimpleNamespace
from protocol import TelemetryBuffer


class GatewayTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.buffer = TelemetryBuffer()
        self.server = TestServer(create_app(self.buffer, 16, {'https://kweontj.github.io'}))
        await self.server.start_server()
        self.client = ClientSession()

    async def asyncTearDown(self):
        await self.client.close()
        await self.server.close()

    async def test_origin_and_health(self):
        response = await self.client.get(self.server.make_url('/health'))
        data = await response.json()
        self.assertTrue(data['read_only'])
        self.assertEqual(data['domain_id'], 16)
        with self.assertRaises(WSServerHandshakeError):
            await self.client.ws_connect(self.server.make_url('/twin'), headers={'Origin': 'https://other.example'})

    async def test_subscription_stream_has_hello_and_new_frames(self):
        ws = await self.client.ws_connect(self.server.make_url('/twin'), headers={'Origin': 'https://kweontj.github.io'})
        hello = await ws.receive_json(timeout=2)
        self.assertEqual(hello['type'], 'hello')
        self.assertTrue(hello['read_only'])
        self.buffer.capture('joint_states', {'name': ['joint1'], 'position': [.2]})
        frame = await ws.receive_json(timeout=2)
        self.assertEqual(frame['topic'], 'joint_states')
        self.assertEqual(frame['message']['position'], [.2])
        await ws.close()

    async def test_incoming_publish_is_rejected(self):
        ws = await self.client.ws_connect(self.server.make_url('/twin'), headers={'Origin': 'https://kweontj.github.io'})
        await ws.receive_json(timeout=2)
        await ws.send_json({'op': 'publish', 'topic': '/cmd_vel', 'msg': {'linear': {'x': 1}}})
        response = await ws.receive(timeout=2)
        self.assertEqual(response.type, WSMsgType.CLOSE)
        self.assertEqual(ws.close_code, 1008)
        self.assertEqual(self.buffer.snapshot()['sequence'], 0)


class SourceTimestampTests(unittest.TestCase):
    def setUp(self):
        self.node = SimpleNamespace(get_clock=lambda: SimpleNamespace(now=lambda: SimpleNamespace(nanoseconds=10_000_000_000)))

    def test_non_object_json_cannot_stop_the_ros_callback(self):
        for text in ['null', '[]', '42', '"text"', '{broken', '{"stamp_ns": false}']:
            self.assertIsNone(source_age_ms(self.node, SimpleNamespace(data=text), 'objects'))

    def test_stale_future_and_valid_ros_timestamps(self):
        for sec, expected in [(9, 1000), (7, None), (11, None), (0, None)]:
            message = SimpleNamespace(header=SimpleNamespace(stamp=SimpleNamespace(sec=sec, nanosec=0)))
            self.assertEqual(source_age_ms(self.node, message, 'joint_states'), expected)


if __name__ == '__main__':
    unittest.main()
