// Location registry for MD Exhibition.
// `name` MUST match the NocoDB `Location` SingleSelect value exactly
// (Thai with combining marks — do not retype).
// Maps: the gym has its own map; every other location links to the overall map.
export const locations = [
  { name: "เวทีใหญ่", map: "/imgs/maps/map-overall.jpeg" },
  { name: "หอประชุม", map: "/imgs/maps/map-overall.jpeg" },
  { name: "MDO", map: "/imgs/maps/map-overall.jpeg" },
  { name: "ลานอัญจลา", map: "/imgs/maps/map-overall.jpeg" },
  { name: "ห้องศิลปะ/ลานอุร์สุลา", map: "/imgs/maps/map-overall.jpeg" },
  { name: "Workshopโรงยิมฯ", map: "/imgs/maps/map-gymnasium.jpeg" },
]
