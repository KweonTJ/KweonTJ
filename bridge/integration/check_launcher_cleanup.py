#!/usr/bin/env python3
"""ROS integration check: a failed gateway must stop the C++ bridge grandchild.

Run after sourcing ROS 2 and installing domain_bridge/aiohttp. Uses isolated test
domains 229/228 and loopback port 8770; no robot-command publishers are started.
"""
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import urllib.request


def descendants(pid):
    rows = [line.split() for line in subprocess.check_output(
        ['ps', '-eo', 'pid=,ppid='], text=True).splitlines()]
    children = [int(child) for child, parent in rows if int(parent) == pid]
    return children + [item for child in children for item in descendants(child)]


def main():
    root = Path(__file__).resolve().parents[1]
    launcher = subprocess.Popen([sys.executable, str(root/'run_bridge.py'),
                                 '--source-domain', '229', '--host-domain', '228',
                                 '--port', '8770'])
    try:
        for _ in range(100):
            if launcher.poll() is not None:
                raise AssertionError('Launcher exited before the gateway was ready')
            try:
                urllib.request.urlopen('http://127.0.0.1:8770/health', timeout=.3).close()
                break
            except OSError:
                time.sleep(.1)
        else:
            raise AssertionError('Gateway did not become ready')
        time.sleep(.3)
        children = descendants(launcher.pid)
        gateway = next(pid for pid in children
                       if b'gateway.py' in Path(f'/proc/{pid}/cmdline').read_bytes())
        assert any(b'/lib/domain_bridge/domain_bridge' in
                   Path(f'/proc/{pid}/cmdline').read_bytes() for pid in children)
        os.kill(gateway, signal.SIGTERM)
        assert launcher.wait(timeout=10) == 1
        time.sleep(.3)
        for pid in children:
            status = Path(f'/proc/{pid}/status')
            assert not status.exists() or '\nState:\tZ' in status.read_text(), (
                f'Leaked running child {pid}')
        print('PASS: gateway exit stops launcher and the C++ domain_bridge grandchild')
    finally:
        if launcher.poll() is None:
            launcher.terminate()
            launcher.wait(timeout=10)


if __name__ == '__main__':
    main()
