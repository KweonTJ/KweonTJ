// Curated from repository READMEs and source trees; reviewed 2026-10-16 (KST).
// Topic links describe subject matter, not code dependencies or validated hardware results.
export const topics = [
  {
    id: "learning",
    label: "Robot learning",
    color: "#e9a383",
    description:
      "From reinforcement-learning foundations to locomotion and residual arm control. Policies are evaluated in simulation before deployment.",
    keywords: ["PPO", "PyTorch", "JAX / Brax"],
  },
  {
    id: "perception",
    label: "Perception",
    color: "#88c8bd",
    description:
      "Turning RGB-D, markers and images into object poses, maps and useful observations.",
    keywords: ["RGB-D", "ArUco", "SLAM", "OpenCV"],
  },
  {
    id: "autonomy",
    label: "Autonomy",
    color: "#b4a4db",
    description:
      "Connecting localization, path tracking and robot coordination to navigation and transport.",
    keywords: ["Navigation", "Pure Pursuit", "Coordination"],
  },
  {
    id: "systems",
    label: "Robot systems",
    color: "#89b7de",
    description:
      "The interfaces between software and machines: ROS runtimes, firmware, communication and motor control.",
    keywords: ["ROS 2", "C / C++", "Embedded control"],
  },
  {
    id: "simulation",
    label: "Simulation & twins",
    short: "Simulation",
    color: "#dcc58b",
    description:
      "Robot models and environments for inspecting geometry, exploring controls and studying behavior in simulation.",
    keywords: ["MuJoCo", "Isaac Sim", "URDF", "Digital twins"],
  },
  {
    id: "foundations",
    label: "ML & foundations",
    short: "Foundations",
    color: "#aeb8c9",
    description:
      "Coursework and early experiments behind the robotics projects: machine learning, algorithms and embedded programming.",
    keywords: ["NumPy", "Scikit-learn", "Algorithms"],
  },
];
// Exactly one graph entry per authored repository; original names are kept in `repo`.
export const repositories = [
  {
    id: "go2",
    name: "Go2 Locomotion",
    repo: "HIMLoco_Horizontal",
    topics: ["learning", "simulation", "autonomy"],
    featured: true,
    description:
      "Terrain/contact rewards, body-motion analysis and path-tracking evaluation for Unitree Go2 in Isaac Gym. The documented mixed-course result is 5/5 simulation runs; real-robot validation is pending.",
    stack: ["Isaac Gym", "PyTorch", "PPO"],
    kind: "Simulation study",
  },
  {
    id: "omx-training",
    name: "OMX Learning",
    repo: "omx_train_ws",
    topics: ["learning", "simulation"],
    featured: true,
    description:
      "Four-joint PPO residual control around a reference controller for arm pick/hold/place. The existing delivery policy reports 100/100 full-tower and 98/100 robustness successes in simulation; the newer shelf task has no trained policy yet.",
    stack: ["MuJoCo", "PPO", "Stable-Baselines3"],
    kind: "Policy training",
    lab: "./lab/mujoco.html",
  },
  {
    id: "omx-runtime",
    name: "OMX Runtime",
    repo: "Omx_Turtle_Bot",
    topics: ["systems", "perception", "simulation"],
    featured: true,
    description:
      "ROS 2 deployment workspace connecting ArUco/TF perception, Python/C++ policy runtimes and delivery coordination. Current work includes a tracked leader, two-tier shelf twin and perception-only multi-object profile.",
    stack: ["ROS 2", "C++ / Python", "ArUco", "TF2"],
    kind: "Robot runtime",
    lab: "./simulator/",
  },
  {
    id: "mobile",
    name: "3D Mobile Manipulation",
    short: "3D Manipulation",
    repo: "3D_pereception_Based_Mobile_Manipulator-Autonomous_Navigation_System",
    topics: ["perception", "autonomy", "systems"],
    featured: true,
    description:
      "RGB-D object localization, coordinate transforms and perception-guided pick-and-place, connected to TurtleBot3 leader–follower transport. Includes hardware and Gazebo/RViz launch paths.",
    stack: ["RGB-D", "TF2", "ROS 2", "TurtleBot3"],
    kind: "Mobile manipulation",
  },
  {
    id: "rescue",
    name: "AI Rescue Box",
    repo: "AI_Rescue_Box",
    topics: ["perception", "systems"],
    featured: true,
    description:
      "Jetson-based person detection and RGB-D RTAB-Map SLAM with floor-plan alignment, a field interface and compact UWB rescue-mapping messages. A project implementation, not a field-performance certification.",
    stack: ["Jetson", "RTAB-Map", "RGB-D", "UWB"],
    kind: "Edge perception",
  },
  {
    id: "orv",
    name: "ORV 4WD",
    repo: "ORV_4WD",
    topics: ["systems", "simulation", "autonomy"],
    featured: true,
    description:
      "A ROS 2 rover workspace with encoder/PID firmware, odometry, a Qt configuration GUI and a MuJoCo model. Defaults to mock hardware with actuation disabled; physical parameters still require calibration.",
    stack: ["ROS 2", "Arduino", "MuJoCo", "PID"],
    kind: "Systems integration",
    image: "./assets/projects/orv-4wd.png",
  },
  {
    id: "go2-mjx",
    name: "Go2 MJX",
    repo: "Go2_MJX_ws",
    topics: ["learning", "autonomy", "simulation"],
    featured: true,
    description:
      "Go2 locomotion and navigation using JAX/Brax PPO and MuJoCo Playground. Waypoint planning and Pure Pursuit supply goals to a velocity-tracking locomotion policy; stair work remains in development.",
    stack: ["MJX", "JAX / Brax", "PPO", "Pure Pursuit"],
    kind: "Learning & navigation",
  },
  {
    id: "go2-control",
    name: "Go2 ROS 2 Control",
    short: "Go2 Control",
    repo: "Unitree_Go2_ROS2_Control",
    topics: ["autonomy", "systems"],
    featured: true,
    description:
      "ROS 2 Twist commands connected to the Unitree Sport API, with keyboard teleoperation, timed trajectories, heading PID, speed limits and command timeouts. The README records real Go2 driving observations.",
    stack: ["ROS 2", "Unitree SDK", "PID"],
    kind: "Robot control",
  },
  {
    id: "morai",
    name: "MORAI Driving",
    repo: "MORAI_Simulation",
    topics: ["autonomy", "perception", "simulation"],
    featured: true,
    description:
      "ERP-42 autonomous-driving work combining GPS/IMU localization, Pure Pursuit steering, speed planning, YOLO traffic-light detection and LiDAR obstacle clustering.",
    stack: ["MORAI", "Pure Pursuit", "YOLO", "LiDAR"],
    kind: "Autonomous driving",
  },
  {
    id: "dual-arm",
    name: "Dual Arm",
    repo: "Dual_Arm",
    topics: ["simulation", "systems"],
    featured: true,
    description:
      "AX-12A dual-arm URDF modeling from photographs and FP04 dimensions, with browser/RViz previews, 12-joint control and physics experiments. Physical calibration and hardware synchronization are pending.",
    stack: ["URDF", "MuJoCo", "Dynamixel"],
    kind: "Robot modeling",
    image: "./assets/projects/dual-arm.png",
  },
  {
    id: "cbnu",
    name: "CBNU E9",
    repo: "CBNU_E9",
    topics: ["simulation"],
    featured: true,
    description:
      "A two-floor Isaac Sim USD environment based on a building floor plan and site images, with stairs, furniture and dynamic objects. An approximation for simulation, not surveyed CAD.",
    stack: ["Isaac Sim", "USD", "Environment modeling"],
    kind: "Simulation environment",
  },
  {
    id: "depth",
    name: "RGB-D Coordinates",
    repo: "Basic_Usage_of_a_3D_Camera_in_ROS2_Humble_Coordinate_Extraction",
    topics: ["perception", "systems"],
    featured: true,
    description:
      "Orbbec Astra setup, depth/point-cloud processing, ROI-based 3D coordinates and depth/color tracking experiments in ROS 2 Humble.",
    stack: ["RGB-D", "ROS 2", "OpenCV"],
    kind: "Perception experiments",
  },
  {
    id: "mujoco-arm",
    name: "MuJoCo Manipulator",
    short: "Manipulator RL",
    repo: "MuJoCo_Manipulator",
    topics: ["learning", "simulation"],
    description:
      "Custom manipulator environments and PPO/SAC experiments using MuJoCo, Gymnasium and Stable-Baselines3. The overview does not establish hardware success rates.",
    stack: ["MuJoCo", "Gymnasium", "PPO / SAC"],
    kind: "RL experiments",
  },
  {
    id: "turtlebot-4wd",
    name: "4WD Mobile Manipulator",
    short: "4WD Manipulator",
    repo: "Turtlebot3_4Way_OpenManipulater",
    topics: ["systems", "perception"],
    description:
      "A custom four-wheel TurtleBot3 Burger with OpenMANIPULATOR-X, visual-following packages and HSV color tracking, connected to robot firmware.",
    stack: ["TurtleBot3", "OpenMANIPULATOR", "OpenCV"],
    kind: "Robot integration",
  },
  {
    id: "cafe",
    name: "Café Automation",
    repo: "cafe_manager",
    topics: ["systems", "perception"],
    description:
      "ROS 1 OpenManipulator café workspace with QR detection, serial input, recipe/order handling and a coffee-cycle arm-command executor. No verified completion rate is documented.",
    stack: ["ROS 1", "OpenManipulator", "QR", "Serial"],
    kind: "Automation workspace",
  },
  {
    id: "firmware",
    name: "4WD Firmware",
    repo: "Turtlebot3_4Way_Firemware",
    topics: ["systems"],
    description:
      "TurtleBot3 firmware adaptations distributing left/right commands to four Dynamixel drive motors. Source is preserved as an archive.",
    stack: ["Dynamixel", "C++", "Firmware"],
    kind: "Firmware archive",
  },
  {
    id: "can",
    name: "CAN Protocol",
    repo: "CAN_Protocol",
    topics: ["systems", "autonomy"],
    description:
      "Vehicle communication work including DBC definitions, motor commands/status, emergency-stop fields, ultrasonic sensing and line tracing.",
    stack: ["CAN", "DBC", "Motor control"],
    kind: "Vehicle communication",
  },
  {
    id: "vehicle-ml",
    name: "Vehicle Health ML",
    repo: "Machine_Learning_Project",
    topics: ["foundations", "autonomy"],
    description:
      "Driving-style classification, event detection and Korean report generation using NumPy/pandas baselines. The smartphone data supports driving-style classification, not engine or battery health diagnosis.",
    stack: ["NumPy", "pandas", "Classification"],
    kind: "Applied ML",
  },
  {
    id: "air",
    name: "Air Device",
    repo: "Air-Device-Project",
    topics: ["perception", "foundations"],
    description:
      "Archived gesture-recognition and virtual keyboard/mouse source using OpenCV, PyTorch/LibTorch and X11. Current runtime behavior has not been validated.",
    stack: ["OpenCV", "PyTorch", "X11"],
    kind: "Source archive",
  },
  {
    id: "deep",
    name: "Deep Learning",
    repo: "Deep_Learning",
    topics: ["foundations", "learning"],
    description:
      "Python/NumPy notebooks and assignments covering perceptrons, arrays, image processing and MNIST neural-network classification.",
    stack: ["NumPy", "Notebooks", "Neural networks"],
    kind: "Coursework",
  },
  {
    id: "rl",
    name: "RL Foundations",
    repo: "Reinforcement_Learning",
    topics: ["foundations", "learning"],
    description:
      "Bandits, non-stationary decisions, Markov decision processes and grid-world policy evaluation, policy iteration and value iteration.",
    stack: ["Bandits", "MDP", "Dynamic programming"],
    kind: "Coursework",
  },
  {
    id: "ai",
    name: "AI / ML & Networks",
    short: "AI Foundations",
    repo: "Artifical_Intelligence",
    topics: ["foundations", "learning"],
    description:
      "NumPy and Scikit-learn coursework on preprocessing, PCA, regression, classification, clustering, backpropagation and regularization. Some notebooks are unfinished or need external datasets.",
    stack: ["NumPy", "Scikit-learn", "MLP"],
    kind: "Coursework",
  },
  {
    id: "ml",
    name: "Machine Learning",
    repo: "Machine_Learning",
    topics: ["foundations", "learning"],
    description:
      "Notebooks on decision trees, SVMs, MLPs, CNNs, RNNs, clustering, PCA and autoencoders, including TensorFlow/Keras exercises.",
    stack: ["Scikit-learn", "TensorFlow", "Notebooks"],
    kind: "Coursework",
  },
  {
    id: "robot-programming",
    name: "Robot Programming",
    short: "ROS 2 Labs",
    repo: "Robot_Programming",
    topics: ["foundations", "systems", "autonomy"],
    description:
      "ROS 2 labs on pub/sub, services, networking, simulated robots and camera-based line following, with Docker support files.",
    stack: ["ROS 2", "TCP / UDP", "Docker"],
    kind: "Coursework",
  },
  {
    id: "video",
    name: "Digital Video Processing",
    short: "Video Processing",
    repo: "Digital_Video_Processing",
    topics: ["foundations", "perception"],
    description:
      "OpenCV exercises in histograms, filtering, geometric transforms, frequency processing, edges, corners, Hough transforms and coin detection.",
    stack: ["OpenCV", "Python", "Image processing"],
    kind: "Coursework",
  },
  {
    id: "algorithms",
    name: "Data Structures & Algorithms",
    short: "Algorithms",
    repo: "Data_Structure_and_Algorithm",
    topics: ["foundations", "autonomy"],
    description:
      "C/C++ data structures, sorting, graph traversal, LCS and path planning with A*, Dijkstra and RRT.",
    stack: ["C / C++", "A* / Dijkstra", "RRT"],
    kind: "Coursework",
  },
  {
    id: "micro",
    name: "Microprocess",
    repo: "Microprocess",
    topics: ["foundations", "systems"],
    description:
      "Embedded/Linux exercises in GPIO, interrupts, timers, PWM motor control, UART, I²C, ultrasonic sensing and camera/QR processing.",
    stack: ["Embedded Linux", "PWM", "UART / I²C"],
    kind: "Coursework",
  },
  {
    id: "driving-course",
    name: "Autonomous Driving Labs",
    short: "Driving Labs",
    repo: "Autonomous_driving_PG_application",
    topics: ["foundations", "autonomy"],
    description:
      "Driving-course assignments and MORAI materials, including sensor recordings, image labeling and a ROS Pure Pursuit controller.",
    stack: ["ROS", "MORAI", "Pure Pursuit"],
    kind: "Coursework",
  },
  {
    id: "ocr",
    name: "OCR Text Recognition",
    short: "OCR",
    repo: "opensw-project.2",
    topics: ["perception", "foundations"],
    description:
      "OpenCV/Tesseract Korean and English OCR in C/C++, with image preprocessing and linked lists for result/file management. Legacy APIs may need updates.",
    stack: ["Tesseract", "OpenCV", "C / C++"],
    kind: "Early project",
  },
  {
    id: "creative",
    name: "Pet Play Robot",
    repo: "Creative-Engineering-Design",
    topics: ["systems", "foundations", "autonomy"],
    description:
      "Arduino engineering-design coursework: a team pet-play robot combining obstacle avoidance, a servo launcher, joystick input and serial coordination, plus individual sensor/control labs.",
    stack: ["Arduino", "PWM", "Ultrasonic", "Serial"],
    kind: "Team project & labs",
  },
  {
    id: "pose",
    name: "Pose Estimation",
    repo: "OpenSWProject",
    topics: ["perception", "foundations"],
    description:
      "Camera-based upper-body posture estimation and warnings, using keypoint angles and a pretrained posture classifier. Preserves notebooks, Python source and sample training artifacts.",
    stack: ["Pose estimation", "Python", "Classification"],
    kind: "Early project",
  },
  {
    id: "pose-followup",
    name: "Posture Monitoring",
    repo: "opensw-project",
    topics: ["perception", "foundations"],
    description:
      "Related PoseProject repository with upper-body/shoulder-angle posture monitoring and warning logic. Shown separately to preserve its repository identity, not counted as an independent validated result.",
    stack: ["Pose estimation", "Python"],
    kind: "Related source",
  },
];
export const inventory = {
  reviewed: "2026-10-16",
  publicCount: 35,
  excluded: [
    { repo: "KweonTJ", reason: "This portfolio and profile" },
    {
      repo: "dynamixel_hardware",
      reason: "Upstream hardware-interface fork / reference",
    },
    { repo: "Go2_IsaacSim", reason: "Empty repository at review time" },
  ],
};
