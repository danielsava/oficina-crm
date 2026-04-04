package modules.iam.usuario;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class UsuarioService {


    @Inject
    UsuarioRepository usuarioRepository;


    public List<Usuario> listar() {

        return usuarioRepository.listAll();
    }

    public Usuario consultarPorId(Long id) {

        return usuarioRepository.findById(id);
    }

    @Transactional
    public Usuario inserir(Usuario usuario) {

        usuarioRepository.persist(usuario);

        return usuario;
    }

    @Transactional
    public Usuario atualizar(Long id, Usuario usuarioAtualizado) {

        Usuario usuario = usuarioRepository.findById(id);

        if (usuario != null) {
            usuario.nome = usuarioAtualizado.nome;
            usuario.login = usuarioAtualizado.login;
            usuario.email = usuarioAtualizado.email;
            usuario.avatar = usuarioAtualizado.avatar;
        }

        return usuario;
    }

    @Transactional
    public boolean excluir(Long id) {

        return usuarioRepository.deleteById(id);
    }

}