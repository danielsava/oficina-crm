package modules.iam.auth;

import io.quarkus.elytron.security.common.BcryptUtil;

/**
 * Serviço responsável por gerar e verificar hashes de senha.
 *
 * Algoritmo: BCrypt com cost factor 12 (~250ms por hash em hardware moderno).
 * O salt é gerado aleatoriamente pelo próprio BcryptUtil e embutido no hash.
 *
 */
public class PasswordHashUtil {

    private static final int BCRYPT_COST = 12;

    public static String hash(String senhaCrua) {

        if (senhaCrua == null || senhaCrua.trim().isEmpty())
            throw new IllegalArgumentException("Senha não pode ser vazia");

        return BcryptUtil.bcryptHash(senhaCrua, BCRYPT_COST);
    }

    public static boolean verify(String senhaCrua, String hashArmazenado) {

        if (senhaCrua == null || hashArmazenado == null || hashArmazenado.isBlank())
            return false;

        return BcryptUtil.matches(senhaCrua, hashArmazenado);
    }

}
