# Shelf lab verification

Verified on 2026-10-16 (Asia/Seoul).

- Browser: Chromium with WebGL, viewport widths 1440, 768, 390, and 320 px. **88 interaction checks passed**: original assets load, joints and gripper move, camera views/inset work, target placement avoids overlapping boxes, reset restores the scene, and the homepage opens the separate lab in a new tab.
- Node: **6 tests passed** for named joint mapping, invalid joint/marker input, base-frame requirements, duplicate markers, and invalid tracking messages.
- Python: **10 tests passed** for gateway origin handling, read-only WebSocket behavior, bounded messages/cache, source and queue age preservation, and out-of-order replay prevention. These also passed on Ubuntu 22.04 / Python 3.10 / aiohttp 3.8.1 in the ROS container.
- Original model: **16 mesh/texture SHA-256 hashes** matched the pinned source, with four original ArUco patterns, 68 links, and 67 joints.
- ROS 2 Humble: official domain_bridge **0.5.0**, humble source commit `f4311f668a1da12545db3e1e37a593ca847d0110`, compiled against the official ROS Humble base image. An isolated synthetic ROS publisher in **domain 231** sent joint states, perception objects/selection, and status. The real domain_bridge forwarded them to **domain 230**, the gateway streamed them, and the browser reflected reordered joint names and selected ID 3.
- Launcher lifecycle: terminating the gateway also stopped the launcher and the actual C++ domain_bridge grandchild; no running descendant processes remained.
- End-to-end: stopping the ROS publisher produced stale joint status and expired object displays. Local controls stayed disabled while connected; disconnect restored the saved local scene. No real robot or motor control was involved.

The normal apt-based Dockerfile could not be built in this execution environment because access to `packages.ros.org` is blocked. For the ROS integration test, the official humble source was built in a separate validation image using the already-installed ROS base dependencies and signed Ubuntu packages. No package/TLS verification was disabled. Native apt/container instructions depend on that host being reachable from the user's bridge PC.

A production ROS domain, bridge host, TLS endpoint, and real-robot data source are not assigned yet. The public website provides local kinematic manipulation plus configurable read-only telemetry input; this verification does not claim live hardware access, a running production gateway, collision-safe trajectories, or shelf-policy inference.

## Lab selection and native scenes

Verified on 2026-10-16 (UTC).

- **50 browser checks passed** at widths 1440, 768, 390 and 320 px: Lab and desktop guide images load without overflow/errors; the shelf card opens the working WebGL viewer; its five controls load; back navigation returns to selection; desktop card opens the scene/launch guide; homepage navigation and callout both target Lab.
- **6 client telemetry tests passed** after adding the selection page; the existing shelf viewer URL, model and ROS protocol are unchanged.
- Native source: `KweonTJ/omx_train_ws`. **5 native tests passed**: three complete URDF-vs-MJCF body-transform checks, gripper/clamp/reset checks, and exact equality of 1,000-step legacy physics before/after styling. The original model/hash/mesh contract check also passed.
- Both native scenes rendered successfully using MuJoCo 3.3.7 and EGL. Preview images are real renders. Desktop GUI mouse/keyboard interaction and full PPO replay were not run in this headless environment. The documented native viewer uses MuJoCo's built-in Control panel; only the existing PPO viewer executes learned-policy inference.
