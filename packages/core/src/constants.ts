export const UNFORGETTABLE_APP_URL = 'https://unforgettable.app/sdk'
export const UNFORGETTABLE_API_URL = 'https://api.unforgettable.app'

export enum RecoveryFactor {
  Face = 1,
  Image = 2,
  Password = 3,
}

export const ALL_RECOVERY_FACTORS: RecoveryFactor[] = Object.values(RecoveryFactor).filter(
  factor => typeof factor === 'number',
)
