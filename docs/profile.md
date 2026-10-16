# GitHub profile fields

The profile README is updated through this repository. The short biography and website beside the avatar are GitHub account settings and are still empty as of 2026-10-16.

## Ready-to-use fields

**Bio**

```text
Robotics engineer building learning-based control, 3D perception, and ROS 2 systems for legged robots and mobile manipulators.
```

**Website**

```text
https://kweontj.github.io/KweonTJ/
```

These can be entered through **Edit profile** on https://github.com/KweonTJ or https://github.com/settings/profile. Account-profile API access is unavailable in the current execution environment; these fields were not changed automatically.

## Website introduction popup

The portfolio's **Introduce** navigation item opens a self-introduction dialog. Its content is maintained in [`assets/knowledge/profile.mjs`](../assets/knowledge/profile.mjs), separately from GitHub's account settings. It includes 권택주 / Kwon Taek Ju, `cbnuai@chungbuk.ac.kr`, 충북대학교 지능로봇공학과, 더블클릭 창업 동아리 (4년 활동, 3년간 회장), and five representative repository links. This biography was supplied by the owner; degree-completion status and calendar dates were not inferred.

Add future course names to `education.courses`, for example as individual strings in that array. The popup currently marks courses for later addition, as requested. `projects` contains repository IDs from the reviewed project inventory.
