export function mkSlug(name: string): string {
  return (name || 'your-company')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32) || 'your-company'
}

export function getGreeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function formatDate(date: Date = new Date()): string {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['January','February','March','April','May','June',
    'July','August','September','October','November','December']
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
}
