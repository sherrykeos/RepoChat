package repochat.backend.security.crypto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

public class VersionedTokenEncryptorTest {

    private static final String PASSWORD = "test-secret-password-1234567890";
    private static final String SALT = "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";

    private final VersionedTokenEncryptor encryptor = new VersionedTokenEncryptor(PASSWORD, SALT);

    @Test
    void testRoundTripEncryption() {
        String token = "ghp_MockGitHubPersonalAccessToken998877665544332211";
        String encrypted = encryptor.encrypt(token);

        assertNotNull(encrypted);
        assertTrue(encrypted.startsWith(VersionedTokenEncryptor.V2_PREFIX));
        assertNotEquals(token, encrypted);

        String decrypted = encryptor.decrypt(encrypted);
        assertEquals(token, decrypted);
    }

    @Test
    void testRandomIvProducesDifferentCiphertextsForSamePlaintext() {
        String token = "ghp_MockGitHubToken123";
        String encrypted1 = encryptor.encrypt(token);
        String encrypted2 = encryptor.encrypt(token);

        assertNotEquals(encrypted1, encrypted2, "AES-GCM must use random IV per encryption operation");
        assertEquals(token, encryptor.decrypt(encrypted1));
        assertEquals(token, encryptor.decrypt(encrypted2));
    }

    @Test
    @SuppressWarnings("deprecation")
    void testLegacyDecryptCompatibility() {
        // Generate ciphertext using Spring's legacy Encryptors.text
        TextEncryptor legacy = Encryptors.text(PASSWORD, SALT);
        String token = "ghp_LegacyUserAccessTokenToMigrate";
        String legacyEncrypted = legacy.encrypt(token);

        assertFalse(legacyEncrypted.startsWith(VersionedTokenEncryptor.V2_PREFIX));

        // VersionedTokenEncryptor must transparently decrypt legacy ciphertext
        String decrypted = encryptor.decrypt(legacyEncrypted);
        assertEquals(token, decrypted);
    }

    @Test
    void testTamperedCiphertextThrowsException() {
        String token = "ghp_SensitiveCredentialToProtect";
        String encrypted = encryptor.encrypt(token);

        // Tamper with the ciphertext payload
        char lastChar = encrypted.charAt(encrypted.length() - 1);
        char replacedChar = (lastChar == 'A') ? 'B' : 'A';
        String tampered = encrypted.substring(0, encrypted.length() - 1) + replacedChar;

        assertThrows(IllegalStateException.class, () -> encryptor.decrypt(tampered),
                "Decryption of modified ciphertext must fail authentication tag check");
    }

    @Test
    void testWrongKeyFailsDecryption() {
        String token = "ghp_SecretTokenUnderKey";
        String encrypted = encryptor.encrypt(token);

        VersionedTokenEncryptor wrongEncryptor = new VersionedTokenEncryptor("wrong-password-999999999", SALT);
        assertThrows(IllegalStateException.class, () -> wrongEncryptor.decrypt(encrypted));
    }

    @Test
    void testEmptyAndNullHandling() {
        assertNull(encryptor.encrypt(null));
        assertEquals("", encryptor.decrypt(""));
        assertEquals("", encryptor.decrypt(null));
    }
}
