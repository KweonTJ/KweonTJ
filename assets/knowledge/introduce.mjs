import { profile } from "./profile.mjs";
import { repositories } from "./data.mjs";
import { containDialogFocus } from "./dialog-focus.mjs";
const dialog = document.getElementById("intro-dialog");
containDialogFocus(dialog);
const open = document.getElementById("intro-open");
const close = document.getElementById("intro-close");
const body = document.getElementById("intro-content");
const make = (tag, cls, text) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
};
const hero = make("div", "intro-hero");
const mark = make("div", "intro-mark");
mark.setAttribute("aria-hidden", "true");
mark.append(
  make("span", "intro-mark-world"),
  make("span", "intro-mark-ring"),
  make("span", "intro-mark-type", "KTJ"),
);
const copy = make("div", "intro-hero-copy");
copy.append(make("p", "eyebrow", "INTRODUCE / ABOUT ME"));
const name = make("h2", "", profile.name);
name.id = "intro-title";
copy.append(
  name,
  make("p", "intro-romanized", profile.romanizedName),
  make("p", "intro-description", profile.introduction),
);
hero.append(copy, mark);
const contacts = make("dl", "intro-contacts");
const nameField = make("div");
nameField.append(make("dt", "", "NAME"), make("dd", "", profile.name));
const emailField = make("div");
emailField.append(make("dt", "", "EMAIL"));
const email = make("a", "", profile.email);
email.href = "mailto:" + profile.email;
const emailValue = make("dd");
emailValue.append(email);
emailField.append(emailValue);
contacts.append(nameField, emailField);
const background = make("div", "intro-background");
const education = make("section", "intro-education");
education.append(
  make("p", "eyebrow", "01 / UNDERGRADUATE"),
  make("h3", "", "학부 교육과정"),
  make("p", "intro-university", profile.education.university),
  make("p", "intro-department", profile.education.department),
);
if (profile.education.courses.length) {
  const list = make("ul", "intro-courses");
  for (const course of profile.education.courses)
    list.append(make("li", "", course));
  education.append(list);
} else education.append(make("p", "intro-note", "주요 이수 과목 · 추후 추가"));
const clubs = make("section", "intro-clubs");
clubs.append(
  make("p", "eyebrow", "02 / COMMUNITY"),
  make("h3", "", "동아리 이력"),
);
for (const club of profile.clubs) {
  const entry = make("div", "intro-club");
  entry.append(
    make("p", "intro-club-name", club.name),
    make("p", "intro-club-type", club.type),
  );
  const details = make("div", "intro-club-details");
  details.append(make("span", "", club.duration), make("span", "", club.role));
  entry.append(details);
  clubs.append(entry);
}
background.append(education, clubs);
const publications = profile.publications || [];
const research = make("section", "intro-publications");
research.setAttribute("aria-labelledby", "intro-publications-title");
research.append(make("p", "eyebrow", "03 / PUBLICATIONS"));
const researchTitle = make("h3", "", "논문");
researchTitle.id = "intro-publications-title";
research.append(researchTitle);
for (const publication of publications) {
  const article = make("article", "intro-paper");
  const top = make("div", "intro-paper-top");
  const title = make("h4", "intro-paper-title", publication.title);
  const link = make("a", "intro-paper-link", "DBpia ↗");
  link.href = publication.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", publication.title + " — DBpia 논문 보기");
  top.append(title, link);
  article.append(top);
  const citation = [publication.venue, publication.year, publication.pages]
    .filter(Boolean)
    .join(" · ");
  if (citation) article.append(make("p", "intro-paper-citation", citation));
  if (publication.authors?.length)
    article.append(
      make("p", "intro-paper-authors", publication.authors.join(" · ")),
    );
  article.append(make("p", "intro-paper-summary", publication.summary));
  if (publication.summarySource)
    article.append(
      make(
        "p",
        "intro-paper-source",
        publication.summarySource === "full-text"
          ? "본문 기반 요약"
          : "초록 기반 요약",
      ),
    );
  research.append(article);
}
const work = make("section", "intro-github");
const heading = make("div", "intro-github-heading");
const labels = make("div");
labels.append(
  make(
    "p",
    "eyebrow",
    (publications.length ? "04" : "03") + " / SELECTED GITHUB",
  ),
  make("h3", "", "대표 GitHub"),
);
const github = make("a", "intro-profile-link", "KweonTJ ↗");
github.href = profile.github;
github.target = "_blank";
github.rel = "noopener noreferrer";
heading.append(labels, github);
const grid = make("div", "intro-projects");
for (const [i, id] of profile.projects.entries()) {
  const r = repositories.find((r) => r.id === id);
  if (!r) continue;
  const a = make("a", "intro-project");
  a.href = "https://github.com/KweonTJ/" + r.repo;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.append(
    make("span", "intro-project-number", String(i + 1).padStart(2, "0")),
  );
  const text = make("span");
  text.append(
    make("strong", "", r.name),
    make("small", "", r.stack.join(" · ")),
  );
  a.append(text, make("span", "intro-project-arrow", "↗"));
  grid.append(a);
}
work.append(heading, grid);
body.append(hero, contacts, background);
if (publications.length) body.append(research);
body.append(work);
open.addEventListener("click", () => {
  document.documentElement.classList.add("intro-open");
  dialog.showModal();
  dialog.scrollTo({ top: 0, behavior: "instant" });
});
close.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.documentElement.classList.remove("intro-open");
  open.focus({ preventScroll: true });
});
dialog.addEventListener("click", (e) => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    dialog.close();
});
