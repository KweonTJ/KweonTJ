#!/usr/bin/env python3
"""Start the actual ROS 2 domain_bridge and a read-only web gateway."""
import argparse
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-domain', required=True, type=int,
                        help='The robot domain. Never inferred from the environment.')
    parser.add_argument('--host-domain', type=int, default=16,
                        help='Visualization domain; defaults to the existing monitor host domain.')
    parser.add_argument('--bind', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8769)
    parser.add_argument('--allow-origin', action='append')
    parser.add_argument('--use-sim-time', action='store_true')
    args = parser.parse_args()
    if not all(0 <= n <= 232 for n in [args.source_domain, args.host_domain]):
        parser.error('Domain IDs must be 0..232')
    if args.source_domain == args.host_domain:
        parser.error('Robot and visualization domains must differ')
    if not 1 <= args.port <= 65535:
        parser.error('Port must be 1..65535')
    if not shutil.which('ros2'):
        parser.error('Source /opt/ros/humble/setup.bash and install domain_bridge first')
    root = Path(__file__).resolve().parent
    bridge = ['ros2', 'run', 'domain_bridge', 'domain_bridge', '--from', str(args.source_domain),
              '--to', str(args.host_domain), str(root/'domain_bridge.yaml')]
    gateway = [sys.executable, str(root/'gateway.py'), '--domain', str(args.host_domain),
               '--bind', args.bind, '--port', str(args.port)]
    for origin in args.allow_origin or []:
        gateway.extend(['--allow-origin', origin])
    if args.use_sim_time:
        gateway.append('--use-sim-time')
    children = []
    stopped = False
    def stop(_signum, _frame):
        nonlocal stopped
        stopped = True
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    try:
        children.append(subprocess.Popen(bridge, start_new_session=True))
        children.append(subprocess.Popen(gateway, start_new_session=True))
        print(f'ROS domain {args.source_domain} -> {args.host_domain} -> ws://{args.bind}:{args.port}/twin', flush=True)
        while not stopped:
            failed = [child for child in children if child.poll() is not None]
            if failed:
                raise RuntimeError('Bridge or gateway exited; stopped both processes')
            time.sleep(.2)
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 1
    finally:
        for child in children:
            try:
                # ros2 run starts the C++ bridge as a grandchild; stop its whole group.
                os.killpg(child.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        for child in children:
            try:
                child.wait(timeout=5)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(child.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                child.wait()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
