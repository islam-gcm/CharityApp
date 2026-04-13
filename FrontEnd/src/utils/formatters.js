export const formatDate = (value) => {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const titleCase = (value = '') =>
  value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
