// Maps a subject/learning-area name to a Font Awesome (Pro, duotone) icon class.
// Keyword-based (English + Thai), so it keeps working if the label wording drifts
// a little. Falls back to a generic icon.
const RULES = [
  { match: ["English", "english", "ภาษาอ", "ภาษาอังกฤษ", "ภาษาอังกฤ"], icon: "fa-language" },
  { match: ["Chinese", "chinese", "ภาษาจีน"], icon: "fa-yin-yang" },
  { match: ["French", "french", "ภาษาฟ"], icon: "fa-flag" },
  { match: ["Japanese", "japanese", "ภาษาญ"], icon: "fa-torii-gate" },
  { match: ["Thai", "ภาษาไทย"], icon: "fa-comment-dots" },
  { match: ["คณิต", "math", "maths"], icon: "fa-calculator" },
  { match: ["วิทยาศาสตร์", "เทคโนโลยี", "science", "technology"], icon: "fa-flask" },
  { match: ["ศิลปะ", "art"], icon: "fa-palette" },
  { match: ["สุขศึกษา", "พลศึกษา", "health", "pe", "พล"], icon: "fa-person-running" },
  { match: ["สังคม", "social"], icon: "fa-globe" },
  { match: ["การงาน", "อาชีพ", "career", "vocational"], icon: "fa-toolbox" },
  { match: ["คำสอน", "religion", "noel", "คริสต์", "คริสต"], icon: "fa-book-open" },
  { match: ["ปฐมวัย", "อนุบาล", "early", "kindergarten", "child"], icon: "fa-child" },
];

export function subjectIcon(name) {
  const s = String(name ?? "").toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some((m) => s.includes(m.toLowerCase()))) {
      return `fa-duotone fa-solid ${rule.icon}`;
    }
  }
  return "fa-duotone fa-solid fa-square";
}
