# Repository index

[← Back to profile](../README.md)

All **31 public repositories** listed on [KweonTJ's GitHub](https://github.com/KweonTJ?tab=repositories), reviewed on **2026-10-11 (KST)**. Summaries use repository READMEs, file trees, and representative source files where documentation is missing. This is a project index, not a claim that every project has been built or validated on hardware. Private repositories are outside this public inventory.

## Legged locomotion & navigation

- **[HIMLoco Horizontal](https://github.com/KweonTJ/HIMLoco_Horizontal)** — Adapts OpenRobotLab HIMLoco to Unitree Go2, with terrain/contact rewards, body-motion analysis, and path-tracking evaluation. The documented `model_3800` completed a 29 m Isaac Gym mixed course in 5/5 runs (seeds 42–46); high-stair evaluation was 58/100. Real-robot validation is pending.
- **[Go2 MJX](https://github.com/KweonTJ/Go2_MJX_ws)** — MuJoCo Playground–based Go2 locomotion and navigation using JAX/Brax PPO. Global/local goals feed a waypoint planner and Pure Pursuit controller, then a velocity-tracking locomotion policy. Includes a navigation app; stair locomotion remains in development.
- **[Unitree Go2 ROS 2 Control](https://github.com/KweonTJ/Unitree_Go2_ROS2_Control)** — Bridges ROS 2 `geometry_msgs/Twist` commands to Unitree Sport API calls. Includes keyboard teleoperation, timed trajectories, heading PID, speed limits, and command timeout handling. The README records real Go2 driving observations.

## Manipulation & mobile robots

- **[OMX training](https://github.com/KweonTJ/omx_train_ws)** — MuJoCo training and evaluation for OpenMANIPULATOR-X pick/hold/place sequences. PPO provides residual corrections around a reference controller; the learned policy controls four arm joints, not base navigation. The documented `arm_delivery_pitch_hold_v4` reports 100/100 full-tower and 98/100 robustness successes in simulation.
- **[OMX TurtleBot](https://github.com/KweonTJ/Omx_Turtle_Bot)** — ROS 2 deployment workspace for TurtleBot3 Waffle Pi and OpenMANIPULATOR-X. ArUco/TF perception feeds Python or C++ policy runtimes, with base-command arbitration and a delivery coordinator. Navigation is external; the C++ runtime is implemented but not yet hardware-validated. Builds on ROBOTIS packages.
- **[3D mobile manipulation](https://github.com/KweonTJ/3D_pereception_Based_Mobile_Manipulator-Autonomous_Navigation_System)** — UROP workspace connecting RGB-D perception, hybrid close-range tracking, coordinate transforms, pick-and-place, and leader–follower transport. Includes launch paths for hardware and Gazebo/RViz simulation.
- **[MuJoCo Manipulator](https://github.com/KweonTJ/MuJoCo_Manipulator)** — Manipulator RL experiments using MuJoCo, Gymnasium, and Stable-Baselines3. The documented goals cover custom environments, PPO/SAC, and pick-and-place policy learning; no hardware success rate is established by the overview.
- **[TurtleBot3 4WD + OpenManipulator](https://github.com/KweonTJ/Turtlebot3_4Way_OpenManipulater)** — A custom four-wheel Burger platform with OpenMANIPULATOR-X, camera perception, and HSV color following. Includes visual-following packages and robot/firmware integration.
- **[Café manager](https://github.com/KweonTJ/cafe_manager)** — ROS 1 OpenManipulator café-automation workspace. Source includes QR detection, serial-to-ROS input, recipe/order handling, and a coffee-cycle executor that sequences arm commands. Based on existing OpenManipulator packages; no top-level README or verified completion rate.

## Robot models, simulation worlds & firmware

- **[Dual Arm](https://github.com/KweonTJ/Dual_Arm)** — AX-12A dual-arm URDF modeling based on photographs and FP04 part dimensions, with a browser/RViz preview and physics simulation. Includes 12-joint control, gravity compensation, PID, monitoring, and CSV recording. Physical calibration and hardware synchronization are pending.
- **[ORV 4WD](https://github.com/KweonTJ/ORV_4WD)** — Raspberry Pi / ROS 2 rover integration with Arduino UNO encoder/PID/PWM firmware, odometry, a Qt configuration GUI, and a MuJoCo model. Uses four conventional wheels and skid steering. Defaults to mock hardware with actuation disabled; hardware parameters still require calibration.
- **[CBNU E9](https://github.com/KweonTJ/CBNU_E9)** — A two-floor Isaac Sim USD environment based on a CBNU building's floor plan and site images, with stairs, partitions, furniture, and dynamic boxes. It approximates proportions and circulation; it is not a surveyed CAD model.
- **[TurtleBot3 4WD firmware](https://github.com/KweonTJ/Turtlebot3_4Way_Firemware)** — TurtleBot3 Burger firmware adaptations for four Dynamixel drive motors and a mobile manipulator. Distributes left/right commands to front/rear wheels. The source is distributed as a compressed archive alongside the overview.

## Perception, autonomy & applied ML

- **[AI Rescue Box](https://github.com/KweonTJ/AI_Rescue_Box)** — Edge rescue-mapping system combining floor plans, RGB-D RTAB-Map SLAM, MediaPipe person detection, depth obstacles, and a common coordinate frame. Includes Jetson processing, a field tablet interface, Windows host review, and ESP32/DWM1000 UWB transport for compact semantic messages. The README describes an ICT competition submission, not a field-performance certification.
- **[ROS 2 depth-camera coordinates](https://github.com/KweonTJ/Basic_Usage_of_a_3D_Camera_in_ROS2_Humble_Coordinate_Extraction)** — Orbbec Astra setup, depth/point-cloud processing, ROI-based 3D position extraction, and depth/color tracking experiments. Documents limitations near the camera's minimum sensing distance.
- **[MORAI Simulation](https://github.com/KweonTJ/MORAI_Simulation)** — ERP-42 autonomous-driving project with GPS/IMU localization, Pure Pursuit steering, PID/curvature-based speed planning, YOLO traffic-light detection, and LiDAR obstacle clustering.
- **[CAN Protocol](https://github.com/KweonTJ/CAN_Protocol)** — Vehicle communication and control work for a CAN competition: DBC definitions, motor commands/status, emergency-stop fields, ultrasonic sensing, and line tracing. Includes reference DBC material from vehicle manufacturers.
- **[Machine Learning Project](https://github.com/KweonTJ/Machine_Learning_Project)** — Vehicle-health reporting pipeline for driving-style classification, event detection, maintenance suggestions, and Korean Markdown reports. Includes NumPy/pandas baselines and synthetic-data demonstrations. The documented real smartphone dataset supports driving-style classification, not engine or battery health claims.
- **[Air Device Project](https://github.com/KweonTJ/Air-Device-Project)** — Archived C++/Python gesture-recognition and virtual keyboard/mouse project using OpenCV, PyTorch/LibTorch, and X11. Both ZIP file listings and representative source files were inspected. It is a source archive with no top-level setup guide; current runtime behavior was not tested.

## Coursework & foundations

- **[Deep Learning](https://github.com/KweonTJ/Deep_Learning)** — Weekly Python/NumPy notebooks and assignments covering perceptrons, arrays, image processing, and MNIST neural-network classification.
- **[Reinforcement Learning](https://github.com/KweonTJ/Reinforcement_Learning)** — Bandits, non-stationary decisions, Markov decision processes, and grid-world dynamic programming. Includes policy evaluation, policy iteration, and value-iteration notebooks.
- **[Artificial Intelligence: ML & NN](https://github.com/KweonTJ/Artifical_Intelligence-ML-NN-)** — Coursework notebooks on preprocessing, PCA, regression, classification, clustering, backpropagation, MLPs, and regularization.
- **[Machine Learning](https://github.com/KweonTJ/Machine_Learning)** — Notebooks covering decision trees, SVMs, MLPs, CNNs, RNNs, clustering, PCA, and autoencoders. Representative autoencoder code uses TensorFlow/Keras.
- **[Robot Programming](https://github.com/KweonTJ/Robot_Programming)** — ROS 2 labs and projects covering publishers/subscribers, services, TCP/UDP, simulated robots, and camera-based line following, with Docker support files.
- **[Digital Video Processing](https://github.com/KweonTJ/Digital_Video_Processing)** — Python/OpenCV exercises in histograms, filtering, geometric transforms, DFT, Canny edges, Harris corners, Hough transforms, and coin detection.
- **[Data Structures & Algorithms](https://github.com/KweonTJ/Data_Structure_and_Algorithm)** — C/C++ implementations covering stacks, linked structures, sorting, graph traversal, LCS, and path planning with A*, Dijkstra, and RRT.
- **[Microprocess](https://github.com/KweonTJ/Microprocess)** — Embedded/Linux exercises in GPIO, interrupts, timers, PWM motor control, UART, I²C, ultrasonic sensing, and camera/QR processing.
- **[Autonomous Driving PG](https://github.com/KweonTJ/Autonomous_driving_PG_application)** — Driving-course assignments and MORAI-related materials, including sensor recordings, image labeling, and a ROS Pure Pursuit controller.

## Fork, empty repository & profile

- **[dynamixel_hardware](https://github.com/KweonTJ/dynamixel_hardware)** — A fork of the upstream `ros2_control` Dynamixel hardware-interface project. Listed as an integration dependency/reference, not as an independently authored driver.
- **[Go2 Isaac Sim](https://github.com/KweonTJ/Go2_IsaacSim)** — Empty at review time: no HEAD commit or source tree. No implementation or results are attributed to it.
- **[KweonTJ](https://github.com/KweonTJ/KweonTJ)** — This GitHub profile, visual assets, and repository index.

## Project images

The profile uses the Dual Arm model preview and the ORV 4WD MuJoCo simulation image from their project repositories. Both images are copied without alteration. [Original images and source revisions](../assets/projects/README.md).
