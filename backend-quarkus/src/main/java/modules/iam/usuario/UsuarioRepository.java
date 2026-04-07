package modules.iam.usuario;

import common.BaseRepository;
import common.EnumStatusEntity;
import jakarta.enterprise.context.ApplicationScoped;
import modules.iam.usuario.dto.UsuarioListDTO;

import java.util.List;

@ApplicationScoped
public class UsuarioRepository implements BaseRepository<Usuario> {





    public List<UsuarioListDTO> listarDTO() {

        return find("status", EnumStatusEntity.ATIVO)
                .project(UsuarioListDTO.class)
                .list();
    }



}
