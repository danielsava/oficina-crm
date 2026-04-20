package modules.iam.seguranca;

import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;
import org.wildfly.security.password.Password;
import org.wildfly.security.password.PasswordFactory;
import org.wildfly.security.password.interfaces.BCryptPassword;
import org.wildfly.security.password.util.ModularCrypt;

/**
 * Serviço responsável por gerar e verificar hashes de senha.
 *
 * Algoritmo: BCrypt com cost factor 12 (~250ms por hash em hardware moderno).
 * O salt é gerado aleatoriamente pelo próprio BcryptUtil e embutido no hash.
 */
@ApplicationScoped
public class PasswordHasher {


    private static final int BCRYPT_COST = 12;


    public String hash(String senhaCrua) {

        if (senhaCrua == null || senhaCrua.isBlank())
            throw new IllegalArgumentException("Senha não pode ser vazia");

        return BcryptUtil.bcryptHash(senhaCrua, BCRYPT_COST);
    }

    public boolean verify(String senhaCrua, String hashArmazenado) {

        if (senhaCrua == null || hashArmazenado == null || hashArmazenado.isBlank())
            return false;

        try {

            PasswordFactory factory = PasswordFactory.getInstance(BCryptPassword.ALGORITHM_BCRYPT);

            Password password = factory.translate(ModularCrypt.decode(hashArmazenado));

            return factory.verify(password, senhaCrua.toCharArray());

        } catch (Exception e) {

            return false;
        }
    }

}
