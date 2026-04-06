package modules.iam.usuario;

import common.BaseService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UsuarioService extends BaseService<Usuario> {


    @Inject
    public UsuarioService(UsuarioRepository usuarioRepository) {

        super(usuarioRepository);
    }


    @Transactional
    public Usuario atualizar(Long id, Usuario usuarioAtualizado) {

        Usuario usuario = repository.findById(id);

        if (usuario != null) {
            usuario.nome = usuarioAtualizado.nome;
            usuario.login = usuarioAtualizado.login;
            usuario.email = usuarioAtualizado.email;
            usuario.avatar = usuarioAtualizado.avatar;
        }

        return usuario;
    }

}