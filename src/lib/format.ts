const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

export function formatDate(date: Date | string) {
  return dateFormatter.format(new Date(date))
}
