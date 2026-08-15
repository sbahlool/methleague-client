/**
 * Profile pictures come in two shapes depending on when they were set:
 * - Legacy / default: a bare filename like 'default.png', served locally
 *   from the frontend's own /uploads folder.
 * - New uploads: a full Cloudinary URL (e.g. 'https://res.cloudinary.com/...'),
 *   already a complete, directly-usable src.
 *
 * This resolves either shape into something safe to drop into an <img src>.
 */
export const getProfilePictureUrl = (profilePicture?: string | null): string => {
  if (!profilePicture) return '/uploads/default.png'
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture
  }
  return `/uploads/${profilePicture}`
}
