// Clés de stockage partagées et migration de la clé historique des compétences.
export const STORAGE_KEYS = {
    CURRENT_PROFILE: 'currentProfile_v1',
    PROFILE_NAMES: 'heroProfileNames_v1',
    PARENT_STATUS: 'heroParentStatus_v1',
    LEGACY_SKILLS: 'heroSkills_v23',
};

export const getStorageKey = (profileId) => `heroSkills_v23_p${profileId}`;
export const getBorderEffectKey = (profileId) => `borderEffect_p${profileId}`;
export const getBorderColorKey = (profileId) => `borderColor_p${profileId}`;

// Copie la clé historique vers la clé du profil 1 si celle-ci est absente.
// La clé historique est conservée : la migration ne détruit aucune donnée.
export const migrateLegacySkills = (storage, profileId = 1) => {
    const legacyValue = storage.getItem(STORAGE_KEYS.LEGACY_SKILLS);
    const targetKey = getStorageKey(profileId);

    if (!legacyValue || storage.getItem(targetKey)) return false;

    storage.setItem(targetKey, legacyValue);
    return true;
};
