# ROS 2 → Shelf Twin Lab

The website's **ROS 2 connection** panel can display live robot joints and the new shelf-perception messages. Source domain and server address are deliberately not fixed yet.

```text
Robot / perception domain (choose ID)
    │  ROS 2 domain_bridge — one-way telemetry
    ▼
Visualization domain (default: 16)
    │  gateway.py — telemetry subscribers, no command publishers
    ▼
WebSocket /twin → browser digital twin
```

The static website runs on GitHub Pages. The ROS bridge and gateway run on a Linux PC that can discover the robot's DDS domain. GitHub Pages does not run a ROS process.

## Native ROS 2 Humble setup

On the bridge PC, install the official domain_bridge package and the HTTP/WebSocket dependency:

```sh
sudo apt-get update
sudo apt-get install ros-humble-domain-bridge python3-aiohttp
source /opt/ros/humble/setup.bash
```

Clone this portfolio repository on that PC. Start the bridge with the **actual robot domain**, replacing `7` below:

```sh
python3 bridge/run_bridge.py --source-domain 7 --host-domain 16
```

`--source-domain` is required. Source and host domains must differ; both accept 0–232. Domain 16 follows the existing host-monitor default, and can be changed. The launcher starts the real `ros2 run domain_bridge domain_bridge` executable and the gateway, and stops both if either process exits.

For Gazebo or another publisher using simulated ROS time, pass `--use-sim-time`; `/clock` is also bridged into the visualization domain. For real-time robot publishers, leave it off. Robot and host clocks must be synchronized; zero timestamps, timestamps older than two seconds, and excessive future timestamps are rejected.

## Container option

```sh
docker build -t shelf-web-bridge bridge
docker run --rm --network host shelf-web-bridge \
  python3 run_bridge.py --source-domain 7 --host-domain 16
```

The host networking example is for Linux and DDS discovery. The image contains the same official ROS 2 package and launcher; no simulator or motor controllers start in this container.

## Connect from the website

The gateway listens on **127.0.0.1:8769** by default. Put a TLS reverse proxy in front of it when connecting from the public HTTPS portfolio. For example, after choosing a hostname that points to the bridge PC, a Caddy configuration can be:

```caddy
bridge.example.com {
    reverse_proxy 127.0.0.1:8769
}
```

Open **https://kweontj.github.io/KweonTJ/simulator/**, expand **ROS 2 connection**, enter `wss://bridge.example.com/twin`, and connect. Use your actual hostname. The default accepted browser origin is `https://kweontj.github.io`; no tokens or credentials are stored in the website.

For local development, serve the portfolio on localhost and explicitly allow its origin:

```sh
# Terminal 1 — repository root
python3 -m http.server 8000 --bind 127.0.0.1

# Terminal 2 — ROS environment already sourced
python3 bridge/run_bridge.py --source-domain 7 --host-domain 16 \
  --allow-origin http://127.0.0.1:8000
```

Open `http://127.0.0.1:8000/simulator/` and connect to `ws://127.0.0.1:8769/twin`. HTTPS pages require WSS. If the gateway must listen on another interface, specify `--bind`; its normal default remains loopback. A nondefault endpoint can be entered into the page without modifying or redeploying the website.

## Data contract

| Robot topic | Visualization topic | Type | Browser behavior |
| :--- | :--- | :--- | :--- |
| `/joint_states` | `/web_twin/joint_states` | `sensor_msgs/msg/JointState` | Match joint names, validate ranges, reflect arm and gripper pose. |
| `/perception/objects` | `/web_twin/perception/objects` | `std_msgs/msg/String` JSON | Display valid marker poses for IDs 1–4 in `base_link`. |
| `/perception/selected_info` | `/web_twin/perception/selected_info` | `std_msgs/msg/String` JSON | Display selected marker and tracking status. |
| `/rl_control/status` | `/web_twin/task/status` | `std_msgs/msg/String` | Display robot status text. |
| `/clock` | `/clock` | `rosgraph_msgs/msg/Clock` | Clock source only when the gateway uses `--use-sim-time`. |

QoS is best effort, volatile, depth 5. The domain bridge only forwards these topics toward the visualization domain. There are no robot-command topics or reverse routes.

The gateway exposes `GET /health` and WebSocket `/twin`. It sends schema-versioned `hello` and `telemetry` messages, checks the browser origin, bounds clients and payloads, and closes a socket that tries to send application commands. The browser makes no publish/service/action requests. The gateway has no application publishers; normal ROS node discovery/logging infrastructure may still be present. Local sliders are disabled while telemetry is connected. On disconnect, the saved local scene is restored.

Telemetry packets carry a monotonic sequence and their source-plus-queue age. The client rejects out-of-order, stale and malformed packets. Joint data older than two seconds is visibly stale; invalid or missing object poses are removed and object observations expire after 1.5 seconds. A connected socket alone is not treated as fresh robot data.

The perception contract follows `Omx_Turtle_Bot/omx_eef_vision` (`schema_version=1`). Only valid `base_link` positions are accepted; uncalibrated camera-frame estimates are not treated as world coordinates. Markers are displayed on illustrative 55 × 55 × 50 mm boxes; the incoming pose specifies the marker center and orientation, not a measured object mesh. The fixed robot-base scene is not an odometry/SLAM map viewer.

## Verify before connecting a robot

```sh
# Gateway and protocol tests (aiohttp installed; ROS not required)
python3 -m unittest discover -s bridge/test -v

# Check visualization-domain input after running the bridge
ROS_DOMAIN_ID=16 ros2 topic echo /web_twin/joint_states --once
curl http://127.0.0.1:8769/health

# Optional ROS process-cleanup integration check (isolated test domains 229/228)
python3 bridge/integration/check_launcher_cleanup.py
```

The source domain/server are currently unassigned. There is no active real-robot connection or server deployment bundled with the GitHub Pages site. See [the browser lab documentation](../docs/simulator.md) for the local kinematic controls and model provenance.
