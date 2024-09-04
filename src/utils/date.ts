export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate()
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export const getTimeDiff = (dateString: string, timeString: string): number => {
  const matchDate = new Date(dateString)
  const matchDateTime = new Date(`${matchDate.toISOString().split('T')[0]}T${timeString}:00`)
  const currentTime = new Date()
  return (matchDateTime.getTime() - currentTime.getTime()) / (1000 * 60) // time difference in minutes
}
