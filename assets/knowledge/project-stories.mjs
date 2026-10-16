// Short case notes grounded in docs/repositories.md and the reviewed repository data.
// These describe implementation scope, never inferred hardware achievements.
export const projectStories = {
  go2: {
    headline: "Finding stable ground.",
    work: [
      [
        "Shape the behavior",
        "Terrain and contact rewards guide a Unitree Go2 policy beyond flat-ground walking.",
      ],
      [
        "Read the motion",
        "Body-motion analysis and path tracking make stability and progress visible during evaluation.",
      ],
      [
        "Check the limits",
        "The recorded mixed course spans 29 m. High stairs remain a harder, separately evaluated condition.",
      ],
    ],
    status: "Simulation evaluated; real-robot validation is pending.",
    facts: [
      ["29 m", "mixed course"],
      ["5 / 5", "simulation runs"],
      ["Isaac Gym", "environment"],
    ],
  },
  "omx-training": {
    headline: "Small corrections. Better control.",
    work: [
      [
        "Keep a reference",
        "A reference controller supplies the arm's nominal pick, hold and place motion.",
      ],
      [
        "Learn the residual",
        "PPO adjusts four arm joints around that reference. Base navigation is outside the learned policy.",
      ],
      [
        "Separate the tasks",
        "Delivery-policy results belong to the existing tower scene; the newer shelf task has no trained policy yet.",
      ],
    ],
    status:
      "The delivery policy has simulation evaluations. Shelf RL is still in preparation.",
    facts: [
      ["4", "controlled joints"],
      ["100 / 100", "full-tower simulation"],
      ["98 / 100", "robustness simulation"],
    ],
    image: "./lab/assets/delivery.webp",
    caption: "Existing MuJoCo delivery scene · simulation preview",
  },
  "omx-runtime": {
    headline: "From a marker to a motion.",
    work: [
      [
        "Find the target",
        "ArUco detections and TF transforms provide object poses in the robot's coordinate frames.",
      ],
      [
        "Connect the runtime",
        "Python and C++ policy paths meet base-command arbitration and a delivery coordinator.",
      ],
      [
        "Inspect the shelf",
        "A tracked leader and two-tier shelf twin support current perception and integration work.",
      ],
    ],
    status:
      "The shelf viewer is kinematic. The C++ runtime and the new shelf task still need hardware validation.",
    facts: [
      ["ROS 2", "runtime"],
      ["ArUco / TF2", "perception"],
      ["2 tiers", "shelf twin"],
    ],
    image: "./lab/assets/shelf.webp",
    caption: "Browser shelf twin · manual kinematic visualization",
  },
  mobile: {
    headline: "See it. Reach it. Move together.",
    work: [
      [
        "Locate in 3D",
        "RGB-D observations become object coordinates through perception and frame transforms.",
      ],
      [
        "Reach nearby",
        "Close-range tracking feeds perception-guided pick-and-place behavior.",
      ],
      [
        "Coordinate transport",
        "TurtleBot3 leader–follower transport joins manipulation to mobile-robot coordination.",
      ],
    ],
    status:
      "The workspace includes hardware launch paths and Gazebo/RViz simulation paths.",
  },
  rescue: {
    headline: "Make a space readable.",
    work: [
      [
        "Build the map",
        "RGB-D RTAB-Map SLAM is aligned with a floor plan in a shared coordinate frame.",
      ],
      [
        "Add meaning",
        "Jetson perception combines person detection with depth-based obstacle information.",
      ],
      [
        "Share what matters",
        "Compact UWB messages carry rescue-mapping information to field and host interfaces.",
      ],
    ],
    status:
      "An implemented competition project; no field-performance certification is implied.",
  },
  orv: {
    headline: "One rover. Every interface.",
    work: [
      [
        "Close the loop",
        "Arduino encoder, PID and PWM firmware supplies the low-level drive layer.",
      ],
      [
        "Expose the system",
        "ROS 2 odometry and a Qt configuration interface connect firmware to the host workspace.",
      ],
      [
        "Model before motion",
        "A MuJoCo rover model supports inspection while physical parameters await calibration.",
      ],
    ],
    status:
      "Mock hardware is the default and actuation starts disabled. Physical calibration is pending.",
    caption: "ORV 4WD MuJoCo model · original project image",
  },
  "go2-mjx": {
    headline: "Learning meets a destination.",
    work: [
      [
        "Train the gait",
        "JAX/Brax PPO and MuJoCo Playground support a velocity-tracking locomotion policy.",
      ],
      [
        "Supply the goal",
        "Waypoints and Pure Pursuit connect global/local goals to the policy's velocity commands.",
      ],
      [
        "Explore navigation",
        "A navigation application brings planning and learned locomotion into the same workspace.",
      ],
    ],
    status: "Stair locomotion remains in development.",
  },
  "go2-control": {
    headline: "A command that reaches the robot.",
    work: [
      [
        "Bridge the interfaces",
        "ROS 2 Twist commands are translated into Unitree Sport API calls.",
      ],
      [
        "Shape the motion",
        "Keyboard control, timed trajectories and heading PID cover several command sources.",
      ],
      [
        "Bound the command",
        "Speed limits and command timeouts are included in the control path.",
      ],
    ],
    status: "The repository README records real Go2 driving observations.",
  },
  morai: {
    headline: "A route becomes a drive.",
    work: [
      [
        "Know the pose",
        "GPS and IMU measurements support vehicle localization in MORAI.",
      ],
      [
        "Follow the road",
        "Pure Pursuit steering joins curvature-aware speed planning and PID control.",
      ],
      [
        "Read the surroundings",
        "YOLO traffic-light detection and LiDAR obstacle clustering add perception to driving.",
      ],
    ],
    status: "An ERP-42 autonomous-driving simulation workspace.",
  },
  "dual-arm": {
    headline: "Two arms, built from geometry.",
    work: [
      [
        "Reconstruct the model",
        "Photographs and FP04 dimensions inform an AX-12A dual-arm URDF.",
      ],
      [
        "Inspect the articulation",
        "Browser and RViz previews expose the robot's twelve joints.",
      ],
      [
        "Explore dynamics",
        "Physics experiments include gravity compensation, PID and recorded joint data.",
      ],
    ],
    status: "Physical calibration and hardware synchronization remain pending.",
    facts: [
      ["12", "modeled joints"],
      ["AX-12A", "actuators"],
      ["URDF", "model format"],
    ],
    caption: "Dual Arm URDF model · original project preview",
  },
  cbnu: {
    headline: "A familiar building, in simulation.",
    work: [
      [
        "Start with the site",
        "Floor plans and site photographs guide the building layout.",
      ],
      [
        "Build the environment",
        "USD geometry includes two floors, stairs, partitions and furniture.",
      ],
      [
        "Leave room to experiment",
        "Dynamic objects make the Isaac Sim environment useful for robot-scene exploration.",
      ],
    ],
    status: "An approximate simulation environment, not surveyed CAD.",
    facts: [
      ["2", "floors"],
      ["USD", "scene format"],
      ["Isaac Sim", "environment"],
    ],
  },
  depth: {
    headline: "Pixels become coordinates.",
    work: [
      [
        "Connect the camera",
        "Orbbec Astra setup brings depth and point clouds into ROS 2 Humble.",
      ],
      [
        "Extract a position",
        "Regions of interest and depth/color tracking support 3D coordinate experiments.",
      ],
    ],
    status:
      "The repository documents limits near the camera's minimum sensing distance.",
  },
  "mujoco-arm": {
    headline: "A place to learn manipulation.",
    work: [
      [
        "Define the environment",
        "Custom MuJoCo and Gymnasium environments represent manipulator tasks.",
      ],
      [
        "Compare the policy paths",
        "PPO and SAC experiments use Stable-Baselines3 for policy learning.",
      ],
    ],
    status:
      "RL experiments; the overview does not establish a hardware success rate.",
  },
  "turtlebot-4wd": {
    headline: "Four wheels. One working arm.",
    work: [
      [
        "Extend the platform",
        "A four-wheel TurtleBot3 Burger is combined with OpenMANIPULATOR-X.",
      ],
      [
        "Follow what is seen",
        "HSV tracking and visual-following packages connect camera input to the robot workspace.",
      ],
    ],
    status: "A robot integration workspace connected to custom firmware.",
  },
  cafe: {
    headline: "An order becomes an arm sequence.",
    work: [
      [
        "Take the input",
        "QR detection and serial-to-ROS input feed recipe and order handling.",
      ],
      [
        "Run the sequence",
        "A coffee-cycle executor issues the arm commands in the ROS 1 OpenManipulator workspace.",
      ],
    ],
    status:
      "Source implementation; a verified completion rate is not documented.",
  },
  firmware: {
    headline: "The layer beneath the wheels.",
    work: [
      [
        "Distribute the drive",
        "Left and right commands are distributed to four Dynamixel motors.",
      ],
      [
        "Preserve the integration",
        "TurtleBot3 firmware adaptations are retained with the mobile-manipulator work.",
      ],
    ],
    status:
      "Archived firmware source distributed with the repository overview.",
  },
  can: {
    headline: "Give the vehicle a shared language.",
    work: [
      [
        "Describe the messages",
        "DBC definitions describe vehicle command and status fields.",
      ],
      [
        "Connect the behavior",
        "Motor commands, emergency-stop fields, ultrasonic sensing and line tracing appear in the competition work.",
      ],
    ],
    status:
      "Vehicle communication work with manufacturer DBC reference material.",
  },
  "vehicle-ml": {
    headline: "Turn a drive into a readable report.",
    work: [
      [
        "Classify the pattern",
        "NumPy/pandas baselines analyze driving style and events.",
      ],
      [
        "Explain the output",
        "A pipeline produces maintenance suggestions and Korean Markdown reports.",
      ],
    ],
    status:
      "Smartphone data supports driving-style classification; it does not establish engine or battery diagnosis.",
  },
  air: {
    headline: "A gesture becomes an input.",
    work: [
      [
        "Read the movement",
        "OpenCV and PyTorch/LibTorch source explores gesture recognition.",
      ],
      [
        "Reach the desktop",
        "Virtual keyboard and mouse code connects recognition to X11 input.",
      ],
    ],
    status:
      "A source archive; current runtime behavior has not been validated.",
  },
  deep: {
    headline: "Build the learning blocks.",
    work: [
      [
        "Work with the arrays",
        "Python and NumPy exercises cover perceptrons, array operations and image processing.",
      ],
      [
        "Train a classifier",
        "MNIST notebooks introduce neural-network classification.",
      ],
    ],
    status: "Coursework and learning notebooks.",
  },
  rl: {
    headline: "Before a robot, a decision.",
    work: [
      [
        "Study the choice",
        "Bandits and non-stationary problems introduce sequential decisions.",
      ],
      [
        "Solve the world",
        "Grid-world notebooks implement policy evaluation, policy iteration and value iteration.",
      ],
    ],
    status:
      "Reinforcement-learning coursework built around MDPs and dynamic programming.",
  },
  ai: {
    headline: "Follow the data through the model.",
    work: [
      [
        "Prepare the representation",
        "Preprocessing and PCA lead into regression, classification and clustering.",
      ],
      [
        "Understand the network",
        "Backpropagation, MLPs and regularization are explored through notebooks.",
      ],
    ],
    status:
      "Coursework; some notebooks are unfinished or need external datasets.",
  },
  ml: {
    headline: "Different models. Shared questions.",
    work: [
      [
        "Compare the approaches",
        "Notebooks cover trees, SVMs, clustering and PCA.",
      ],
      [
        "Explore neural models",
        "MLP, CNN, RNN and autoencoder exercises include TensorFlow/Keras work.",
      ],
    ],
    status: "Machine-learning coursework and experiments.",
  },
  "robot-programming": {
    headline: "Make the robot's software talk.",
    work: [
      [
        "Learn the interfaces",
        "ROS 2 publishers, subscribers and services introduce robot communication.",
      ],
      [
        "Join the pieces",
        "Networking, simulated robots and camera-based line following connect the labs.",
      ],
    ],
    status: "Coursework with TCP/UDP exercises and Docker support files.",
  },
  video: {
    headline: "Look inside an image.",
    work: [
      [
        "Transform the signal",
        "Histograms, filters, geometric transforms and frequency processing use OpenCV.",
      ],
      [
        "Find the structure",
        "Edges, corners, Hough transforms and coin detection explore visual features.",
      ],
    ],
    status: "Digital image/video processing coursework.",
  },
  algorithms: {
    headline: "A path starts with a structure.",
    work: [
      [
        "Build the foundations",
        "C/C++ exercises implement data structures, sorting, graph traversal and LCS.",
      ],
      [
        "Search the space",
        "A*, Dijkstra and RRT connect those foundations to path planning.",
      ],
    ],
    status: "Data-structure and algorithm coursework.",
  },
  micro: {
    headline: "Code meets a pin.",
    work: [
      [
        "Control the timing",
        "GPIO, interrupts, timers and PWM motor exercises cover embedded I/O.",
      ],
      [
        "Connect the devices",
        "UART, I²C, ultrasonic sensing and camera/QR work extend the Linux labs.",
      ],
    ],
    status: "Embedded/Linux programming coursework.",
  },
  "driving-course": {
    headline: "Learn the pieces of a drive.",
    work: [
      [
        "Read the recordings",
        "Sensor recordings and image-labeling work support driving-course assignments.",
      ],
      [
        "Track the route",
        "MORAI materials include a ROS Pure Pursuit controller.",
      ],
    ],
    status: "Autonomous-driving coursework and simulation materials.",
  },
  ocr: {
    headline: "From an image to a sentence.",
    work: [
      [
        "Prepare the page",
        "OpenCV preprocessing supports Korean and English OCR.",
      ],
      [
        "Keep the results",
        "C/C++ Tesseract integration uses linked lists for result and file management.",
      ],
    ],
    status: "An early project; legacy APIs may need updates.",
  },
  creative: {
    headline: "Build something that plays.",
    work: [
      [
        "Combine the mechanisms",
        "A team pet-play robot combines obstacle avoidance and a servo launcher.",
      ],
      [
        "Coordinate the inputs",
        "Joystick and serial coordination join Arduino sensor and motor-control labs.",
      ],
    ],
    status:
      "Team engineering-design coursework and individual labs; some sketches are intermediate versions.",
  },
  pose: {
    headline: "Read posture through keypoints.",
    work: [
      [
        "Measure the angles",
        "Camera keypoints support upper-body posture estimation and warnings.",
      ],
      [
        "Use the classifier",
        "Python source and notebooks preserve a pretrained posture-classification path.",
      ],
    ],
    status: "An early project with sample training artifacts.",
  },
  "pose-followup": {
    headline: "Notice a change in posture.",
    work: [
      [
        "Follow the shoulders",
        "Upper-body and shoulder-angle logic monitors posture from camera observations.",
      ],
      [
        "Keep the source connected",
        "This repository preserves related PoseProject monitoring and warning code.",
      ],
    ],
    status:
      "Related source to Pose Estimation, not an independent validated outcome.",
  },
};
