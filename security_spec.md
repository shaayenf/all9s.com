# Security Specification: All9s O/L Student Platform

## 1. Data Invariants
1. A user's private data (`/users/{userId}`) can only ever be accessed or modified by the owner (`request.auth.uid == userId`). Email is strictly isolated from public queries.
2. A public student profile (`/publicProfiles/{userId}`) represents an O/L student's public identity for level-based leaderboards. The `userId` must match the authenticated UID, and cannot be spoofed.
3. Nicknames must be strictly bounded between 2 and 24 characters to prevent UI disruption or buffer overflow injection.
4. Levels must be non-negative integers between 1 and 99. XP and streak counts must be non-negative numbers.
5. User settings (`/userSettings/{userId}`) are strictly private to the user and constrain appearance customization parameters (`themeMode`, `palette`, `accentColor`, `fontSize`).

## 2. Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Write**: Writing a public profile without authentication header. (Must return PERMISSION_DENIED)
2. **Identity Spoofing**: User `uid_A` attempts to write `userId: "uid_B"` in `/publicProfiles/uid_B`. (Must return PERMISSION_DENIED)
3. **Ghost Field Injection**: Adding an unpermitted field `isAdmin: true` to `/publicProfiles/{userId}`. (Must return PERMISSION_DENIED)
4. **Oversized Nickname**: Submitting a 500-character nickname string. (Must return PERMISSION_DENIED)
5. **Negative Level**: Submitting `level: -5` or `xp: -100`. (Must return PERMISSION_DENIED)
6. **Malicious ID Path Poisoning**: Submitting document ID with invalid characters or excessive length (>128 chars). (Must return PERMISSION_DENIED)
7. **Cross-User Private Settings Read**: User `uid_A` attempting to read `/userSettings/uid_B`. (Must return PERMISSION_DENIED)
8. **Cross-User PII Read**: User `uid_A` attempting to read `/users/uid_B`. (Must return PERMISSION_DENIED)
9. **Settings Invalid Palette**: Submitting `palette: "exploit-neon-hack"`. (Must return PERMISSION_DENIED)
10. **Immutable Field Tampering**: Attempting to change `userId` during an update to `/publicProfiles/{userId}`. (Must return PERMISSION_DENIED)
11. **Client-Side Account Creation Tampering**: Non-owner trying to create a `/users/{userId}` record. (Must return PERMISSION_DENIED)
12. **Blanket Delete**: Attempting to delete public profiles or users collection. (Must return PERMISSION_DENIED)
