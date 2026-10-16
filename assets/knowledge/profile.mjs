// Owner-supplied biography. Add reviewed course names to education.courses later.
export const profile = {
  name: "권택주",
  romanizedName: "Kwon Taek Ju",
  email: "cbnuai@chungbuk.ac.kr",
  introduction:
    "강화학습 기반 제어, 3D 인지, 로봇 시스템을 연결합니다. 시뮬레이션에서 학습한 동작을 로봇이 이해하고 실행할 수 있는 소프트웨어로 만드는 데 관심이 있습니다.",
  education: {
    university: "충북대학교",
    department: "지능로봇공학과",
    courses: [],
  },
  clubs: [
    {
      name: "더블클릭",
      type: "창업 동아리",
      duration: "4년 활동",
      role: "3년간 회장",
    },
  ],
  // Citation and summary checked against the owner's two-page paper PDF.
  publications: [
    {
      title: "3차원 인식 기반 모바일 매니퓰레이터 및 자율 이동 시스템",
      authors: ["권택주", "박태형"],
      venue: "ICROS",
      year: "2026",
      url: "https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE12952272",
      summary:
        "RGB-D 3차원 인지, CSRT 추적, IBVS 접근 보정을 통합하고 ROS Domain Bridge로 리더·팔로워를 연결한 ROS 2 기반 모바일 매니퓰레이터 시스템입니다. Gazebo 20회 반복 실험에서 평균 파지 정확도 91.68%, 평균 추종 간격 0.495 m를 기록했습니다. 모든 실험이 상태 로그의 DONE에 도달했지만 팔로워 데크 안착 성공률은 0%로, 물리적 전달과 안착 보정이 후속 과제입니다.",
      summarySource: "full-text",
    },
  ],
  github: "https://github.com/KweonTJ",
  projects: ["go2", "omx-training", "omx-runtime", "mobile", "rescue"],
};
