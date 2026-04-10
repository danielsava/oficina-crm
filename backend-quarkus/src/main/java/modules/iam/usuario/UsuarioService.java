package modules.iam.usuario;

import common.BaseService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import modules.iam.usuario.dto.UsuarioEditDTO;
import modules.iam.usuario.dto.UsuarioMapper;

@ApplicationScoped
public class UsuarioService extends BaseService<Usuario, UsuarioEditDTO> {


    UsuarioMapper mapper;


    public UsuarioService(
            UsuarioRepository usuarioRepository,
            UsuarioMapper mapper
    ) {

        super(usuarioRepository, mapper);
    }



    @Transactional
    public void inserir(@Valid UsuarioEditDTO usuarioEditDTO) {

        Usuario usuario = this.mapper.toEntity(usuarioEditDTO);

        repository.persist(usuario);
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