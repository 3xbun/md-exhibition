// Location registry for MD Exhibition.
// `name` MUST match the NocoDB `Location` SingleSelect value exactly
// (Thai with combining marks — do not retype).
// `icon` is a Font Awesome duotone-solid icon (fa-duotone fa-solid <icon>).
// Maps: the gym has its own map; every other location links to the overall map.
export const locations = [
  {
    name: "เวทีใหญ่",
    map: "/imgs/maps/map-overall.jpeg",
    icon: "fa-masks-theater",
  },
  {
    name: "หอประชุม",
    map: "/imgs/maps/map-overall.jpeg",
    icon: "fa-building-columns",
  },
  { name: "MDO", map: "/imgs/maps/map-overall.jpeg", icon: "fa-music" },
  {
    name: "ลานอัญจลา",
    map: "/imgs/maps/map-overall.jpeg",
    icon: "fa-seedling",
  },
  {
    name: "ห้องศิลปะ/ลานอุร์สุลา",
    map: "/imgs/maps/map-overall.jpeg",
    icon: "fa-palette",
  },
  {
    name: "Workshopโรงยิมฯ",
    map: "/imgs/maps/map-gymnasium.jpeg",
    icon: "fa-dumbbell",
  },
]
