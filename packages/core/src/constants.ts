export const UNFORGETTABLE_APP_URL = 'https://dev.unforgettable.app'
export const UNFORGETTABLE_API_URL = 'https://api.dev.unforgettable.app'

export enum RecoveryFactor {
  Face = 1,
  Image = 2,
  Password = 3,
  Object = 4,
  Book = 5,
  Geolocation = 6,
}

export const ALL_RECOVERY_FACTORS: RecoveryFactor[] = Object.values(RecoveryFactor).filter(
  factor => typeof factor === 'number',
)
