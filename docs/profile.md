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

## Publications

`profile.publications` supplies the Introduce publication cards, placed before Selected GitHub. Each entry uses `title`, `url` (the DBpia article), `summary`, and optional `authors` (ordered strings), `venue`, `year`, `pages` and `summarySource` (`abstract` or `full-text`). Write a short source-grounded summary of the purpose, method and supported results. Keep authorship, venue/date and results tied to the supplied paper; never infer them from a similarly named author or an associated repository. An empty array keeps this section hidden and preserves existing section numbering.

### Included paper and summary sources

The owner supplied the DBpia link for **3차원 인식 기반 모바일 매니퓰레이터 및 자율 이동 시스템** (`NODE12952272`) and uploaded the two-page PDF with the same title. The PDF title block identifies **권택주 · 박태형**, 충북대학교 지능로봇공학과 and **ICROS 2026**, held July 1–3, 2026, at Daegu EXCO. The card uses the title, ordered authors and conference/year from that document. Printed proceedings page numbers are absent, so no page range is shown. DBpia itself returned proxy HTTP 403; the supplied link was not independently read.

The Korean summary is based on the complete PDF, particularly sections 2–3 (system and methods), 4 (experiments/results), Table 1 and section 5 (conclusion). It covers RGB-D/CSRT/IBVS perception and approach control, ROS Domain Bridge coordination and 20 Gazebo trials. Reported mean grasp accuracy is **91.68%** and mean leader–follower spacing is **0.495 m**. Every trial reached `DONE` in the state log, but physical placement on the follower deck succeeded in **0%** of trials. The summary retains that distinction and the unresolved handoff limitation; it does not claim complete physical task success, hardware validation or a measured grasp-success rate. The original table calls the metric “Grasp accuracy,” not “grasp success.”

The uploaded PDF stays outside the public website. The existing contact address remains the owner's requested `cbnuai@chungbuk.ac.kr`; contact details from the paper were not copied into the profile. Only the citation, short summary and owner-supplied DBpia link are published.

Verified on 2026-10-17 (KST): **70 browser assertions passed** against the actual publication at 1440, 768, 390 and 320 px, plus an empty-publications fallback. Checks cover citation/summary fields, result and limitation wording, DBpia destination, source label, section numbering, existing contact email, light title weight, overflow, JavaScript errors and closing/focus restoration. Desktop and narrow-mobile screenshots were also inspected. Synthetic test content is absent from the website source.
