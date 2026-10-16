# Digital Twin Lab

Lab selection: https://kweontj.github.io/KweonTJ/lab/

Shelf viewer (existing route preserved): https://kweontj.github.io/KweonTJ/simulator/

The homepage **Lab** navigation and **Choose your digital twin** callout open the selection page in a new tab. Choose the browser shelf twin or the desktop OMX MuJoCo scenes. Desktop cards link to local launch instructions, not a browser physics runtime. The **OMX Learning** project retains its direct shelf-viewer link. Every viewer links back to the selection page. The profile README also links to the Lab.

`lab/index.html` contains the card collection, `lab/mujoco.html` the desktop scene previews and launch instructions. Their preview images are actual Three.js / MuJoCo renders. To add another available twin, add a card with its preview, runtime label and working route; do not present a planned project as an executable environment. Static Pages deployment includes `lab/`.

Native scene source and verification: https://github.com/KweonTJ/omx_train_ws/blob/main/docs/digital-twin.md

## What runs in the browser

- Original tracked leader robot and two-level shelf, rendered with locally vendored Three.js 0.180.0.
- Actual URDF joint hierarchy, RPY transforms, joint axes/limits, mesh scales, and gripper mimic joint.
- Four arm sliders, gripper control, Stay and observation presets, scene reset.
- Orbit/pan/zoom, front/side/top views, optional axes and automatic camera rotation, fullscreen, and a simulated gripper-camera inset.
- Four illustrative ArUco boxes using the real ID 1–4 patterns from the upstream print SVG. Select them with the buttons or by clicking a box, change shelf level/position, and prevent overlapping placements.
- Optional live telemetry through ROS 2 domain_bridge and a separate WebSocket gateway. See [bridge setup](../bridge/README.md).

This is a kinematic digital twin of the recent shelf preview. The upstream shelf scene is an RViz display approximation, and the new shelf-task RL policy is under development. The old full-tower PPO v4 policy is not used for this different task. This page does not claim to run MuJoCo dynamics, collision checking, learned grasp execution, or motor control. Joint manipulation can visibly intersect the shelf, just as a joint-state/RViz preview can; it is not a collision-free planning result.

The gripper-camera inset is a synthetic view from the exported EEF optical frame. It is not a stream from the physical USB camera, and rendering a marker does not claim an ArUco detector has recognized it.

## Source and reproducible model export

`simulator/assets/scene.json` records the exact upstream source commit and SHA-256 hashes of each copied mesh/texture. It was exported from:

https://github.com/KweonTJ/Omx_Turtle_Bot/tree/3bd5eaa6a74788ac53997f5d826e23c35e49770b

Input files:

- `turtlebot3_manipulation/turtlebot3_manipulation_description/urdf/leader_turtlebot3.urdf`
- `scripts/export_shelf_scene.py` and `scripts/export_raised_shelf_scene.py` in that description package.
- The source package's STL meshes, board textures, and ArUco print sheet.

The shelf uses the raised preview defaults: center X=300 mm; support 400 × 400 × 100 mm; bin width/depth/height 365 × 285 × 180 mm; stack pitch 156 mm. Fine wall/support geometry remains the source model's approximation. Browser target boxes are 55 × 55 × 50 mm illustrative objects, not measured object CAD.

To update from a read-only upstream checkout:

```sh
python3 scripts/export-shelf-model.py --source /path/to/Omx_Turtle_Bot
```

No ROS installation or package install is needed for the export. The upstream checkout is not changed. The exporter reuses the original shelf generator and checks asset paths, link/joint references, and marker patterns. Recheck the scene and controls after model changes.

## Local preview and deployment

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the `/simulator/` path in a WebGL 2 capable browser. All viewer assets, libraries, fonts, and models are local. Static deployment now includes `simulator/`; bridge server files are not included in the Pages artifact. A failed mesh or WebGL initialization produces a retry message, not a fabricated replacement robot.

## Attribution

Robot/shelf assets and export inputs derive from the linked `Omx_Turtle_Bot` repository and ROBOTIS description assets. Their Apache 2.0 license is included as `simulator/assets/UPSTREAM-LICENSE`. The exporter preserves source hashes and does not modify the meshes. Three.js and its matching loaders/controls/utilities are pinned to 0.180.0 with the MIT license under `simulator/vendor/three/LICENSE`.

## Verification

See [recorded browser and ROS 2 checks](simulator-validation.md). Client validation tests run with `node --test tests/telemetry.test.mjs`; gateway/protocol tests run with `python3 -m unittest discover -s bridge/test -v` after installing aiohttp.
