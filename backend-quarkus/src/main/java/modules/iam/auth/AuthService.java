package modules.iam.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import modules.iam.auth.util.PasswordHashUtil;
import modules.iam.usuario.UsuarioService;

@ApplicationScoped
public class AuthService {


    @Inject
    UsuarioService usuarioService;


    public boolean autenticar(String email, String senha) {

        var usuario = usuarioService.buscarPorEmail(email);

        if(usuario == null) {

            // Timing-safe: sempre executa hash para evitar timing attacks
            //   Garante que o tempo de resposta seja similar ao caso de senha incorreta.
            //   Isso evita que um atacante enumere emails válidos por análise de tempo.
            PasswordHashUtil.hash(senha);

            return false;
        }

        return PasswordHashUtil.verify(senha, usuario.getSenhaHash());
    }

}
