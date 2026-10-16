#!/usr/bin/env python3
"""ROS 2 subscribers -> read-only browser WebSocket (no ROS publishers)."""
import argparse
import asyncio
import contextlib
import json
import math
import threading
from aiohttp import web, WSMsgType
from protocol import TelemetryBuffer, MAX_AGE_MS


def create_app(buffer, domain_id, origins, max_clients=8):
    app = web.Application(client_max_size=1024)
    clients = set()

    async def health(request):
        return web.json_response({'schema_version': 1, 'read_only': True,
                                  'domain_id': domain_id, 'clients': len(clients),
                                  **buffer.snapshot()})

    async def socket(request):
        if request.headers.get('Origin') not in origins:
            raise web.HTTPForbidden(text='Origin is not allowed')
        if len(clients) >= max_clients:
            raise web.HTTPServiceUnavailable(text='Viewer limit reached')
        ws = web.WebSocketResponse(heartbeat=20, max_msg_size=1024)
        await ws.prepare(request)
        clients.add(ws)
        await ws.send_json({'schema_version': 1, 'type': 'hello', 'read_only': True,
                            'domain_id': domain_id, 'max_age_ms': MAX_AGE_MS})

        async def send():
            sequence = -1
            while not ws.closed:
                for frame in buffer.frames_after(sequence):
                    await asyncio.wait_for(ws.send_str(json.dumps(frame, allow_nan=False)), timeout=2)
                    sequence = frame['sequence']
                await asyncio.sleep(.05)

        task = asyncio.create_task(send())
        async def close_on_failure():
            try:
                await task
            except (ConnectionError, RuntimeError, asyncio.TimeoutError):
                await ws.close(code=1011, message=b'Telemetry connection stopped')
        watcher = asyncio.create_task(close_on_failure())
        try:
            async for msg in ws:
                if msg.type in (WSMsgType.TEXT, WSMsgType.BINARY):
                    # There is deliberately no command/subscription/publish API.
                    await ws.close(code=1008, message=b'Telemetry only; incoming commands are not supported')
                elif msg.type == WSMsgType.ERROR:
                    break
        finally:
            clients.discard(ws)
            task.cancel(); watcher.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task
            with contextlib.suppress(asyncio.CancelledError):
                await watcher
        return ws

    async def shutdown(_app):
        for ws in list(clients):
            await ws.close(code=1001, message=b'Server shutdown')

    app.router.add_get('/health', health)
    app.router.add_get('/twin', socket)
    app.on_shutdown.append(shutdown)
    return app


def source_age_ms(node, message, channel):
    if channel == 'joint_states':
        stamp = message.header.stamp
        stamp_ns = stamp.sec * 1_000_000_000 + stamp.nanosec
    elif channel in ('objects', 'selected_info'):
        try:
            payload = json.loads(message.data)
            if not isinstance(payload, dict):
                return None
            stamp_ns = payload.get('stamp_ns')
        except (ValueError, TypeError):
            return None
        if not isinstance(stamp_ns, int) or isinstance(stamp_ns, bool):
            return None
    else:
        return 0.0
    if stamp_ns <= 0:
        return None
    age = (node.get_clock().now().nanoseconds - stamp_ns) / 1e6
    # Allow small clock skew, but never turn a stale observation into a new one.
    return max(0.0, age) if math.isfinite(age) and -.2 * 1000 <= age <= MAX_AGE_MS else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--domain', required=True, type=int)
    parser.add_argument('--bind', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8769)
    parser.add_argument('--allow-origin', action='append', default=None)
    parser.add_argument('--use-sim-time', action='store_true')
    args = parser.parse_args()
    if not 0 <= args.domain <= 232 or not 1 <= args.port <= 65535:
        parser.error('Invalid domain or port')
    import rclpy
    from rclpy.context import Context
    from rclpy.node import Node
    from rclpy.executors import SingleThreadedExecutor
    from rclpy.parameter import Parameter
    from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy
    from rosidl_runtime_py.convert import message_to_ordereddict
    from sensor_msgs.msg import JointState
    from std_msgs.msg import String
    context = Context()
    context.init(args=[], domain_id=args.domain)
    node = Node('shelf_web_gateway', context=context,
                parameter_overrides=[Parameter('use_sim_time', value=args.use_sim_time)])
    qos = QoSProfile(depth=5, reliability=ReliabilityPolicy.BEST_EFFORT,
                     durability=DurabilityPolicy.VOLATILE)
    buffer = TelemetryBuffer()
    subscriptions = []
    for channel, topic, kind in [
        ('joint_states', '/web_twin/joint_states', JointState),
        ('objects', '/web_twin/perception/objects', String),
        ('selected_info', '/web_twin/perception/selected_info', String),
        ('task_status', '/web_twin/task/status', String),
    ]:
        def callback(msg, channel=channel):
            age = source_age_ms(node, msg, channel)
            if age is not None:
                buffer.capture(channel, dict(message_to_ordereddict(msg)), age)
        subscriptions.append(node.create_subscription(kind, topic, callback, qos))
    executor = SingleThreadedExecutor(context=context)
    executor.add_node(node)
    thread = threading.Thread(target=executor.spin, daemon=True)
    thread.start()
    origins = set(args.allow_origin or ['https://kweontj.github.io'])
    try:
        web.run_app(create_app(buffer, args.domain, origins), host=args.bind,
                    port=args.port, access_log=None)
    finally:
        executor.shutdown(timeout_sec=2)
        thread.join(timeout=3)
        node.destroy_node()
        context.shutdown()


if __name__ == '__main__':
    main()
