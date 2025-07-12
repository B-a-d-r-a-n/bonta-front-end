export enum UserRole {
  CUSTOMER = 'Customer',
  ADMIN = 'Admin',
  MODERATOR = 'Moderator',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.MODERATOR]: 'Moderator',
};

export const USER_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: [
    'view_products',
    'add_to_cart',
    'place_orders',
    'view_own_orders',
    'update_profile',
  ],
  [UserRole.ADMIN]: [
    'view_products',
    'manage_products',
    'manage_orders',
    'manage_users',
    'view_analytics',
    'manage_system',
  ],
  [UserRole.MODERATOR]: [
    'view_products',
    'manage_products',
    'view_orders',
    'manage_orders',
  ],
};
