export type Preferences = { receiveEmails: boolean; receiveNotifications: boolean };

/** Campo ausente a API mantém como está. */
export type PreferencesChange = Partial<Preferences>;
