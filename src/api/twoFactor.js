// src/api/twoFactor.js
import api from './axios';

// ============================================
// STATUS 2FA
// ============================================

export const getTwoFactorStatus = async () => {
    const response = await api.get('/2fa/status');
    return response.data;
};

// ============================================
// TOTP (Google Authenticator)
// ============================================

export const initTotpSetup = async () => {
    const response = await api.post('/2fa/totp/setup');
    return response.data;
};

export const verifyAndEnableTotp = async (secret, code) => {
    const response = await api.post('/2fa/totp/verify', { secret, code });
    return response.data;
};

export const disableTotp = async (code, password) => {
    const response = await api.delete('/2fa/totp', { 
        data: { code, password } 
    });
    return response.data;
};

// ============================================
// WEBAUTHN (Passkeys, Security Keys)
// ============================================

export const getWebAuthnRegisterOptions = async () => {
    const response = await api.post('/2fa/webauthn/register/options');
    return response.data;
};

export const verifyWebAuthnRegistration = async (response, deviceName) => {
    const res = await api.post('/2fa/webauthn/register/verify', { 
        response, 
        deviceName 
    });
    return res.data;
};

export const getWebAuthnCredentials = async () => {
    const response = await api.get('/2fa/webauthn/credentials');
    return response.data;
};

export const deleteWebAuthnCredential = async (id, code, password) => {
    const response = await api.delete(`/2fa/webauthn/credentials/${id}`, {
        data: { code, password }
    });
    return response.data;
};

export const updateWebAuthnCredentialName = async (id, deviceName) => {
    const response = await api.patch(`/2fa/webauthn/credentials/${id}`, { 
        deviceName 
    });
    return response.data;
};

// ============================================
// BACKUP CODES
// ============================================

export const getBackupCodesCount = async () => {
    const response = await api.get('/2fa/backup-codes/count');
    return response.data;
};

export const regenerateBackupCodes = async (code, password) => {
    const response = await api.post('/2fa/backup-codes/regenerate', { 
        code, 
        password 
    });
    return response.data;
};

// ============================================
// WYŁĄCZENIE 2FA
// ============================================

export const disableTwoFactor = async (code, password) => {
    const response = await api.delete('/2fa', { 
        data: { code, password } 
    });
    return response.data;
};

// ============================================
// LOGI 2FA
// ============================================

export const getTwoFactorLogs = async (limit = 20) => {
    const response = await api.get('/2fa/logs', { params: { limit } });
    return response.data;
};

// ============================================
// WERYFIKACJA 2FA PRZY LOGOWANIU
// ============================================

export const verifyTwoFactorLogin = async (challengeToken, code, method = 'TOTP') => {
    const response = await api.post('/auth/2fa/verify', {
        challengeToken,
        code,
        method
    });
    return response.data;
};

export const verifyWebAuthnLogin = async (challengeToken, webauthnResponse) => {
    const response = await api.post('/auth/2fa/verify', {
        challengeToken,
        response: webauthnResponse,
        method: 'WEBAUTHN'
    });
    return response.data;
};

export const getWebAuthnLoginOptions = async (challengeToken) => {
    const response = await api.post('/auth/2fa/webauthn/options', {
        challengeToken
    });
    return response.data;
};