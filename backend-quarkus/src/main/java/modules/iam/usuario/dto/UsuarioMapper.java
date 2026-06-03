package modules.iam.usuario.dto;

import common.BaseMapper;
import modules.iam.usuario.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "cdi")
public interface UsuarioMapper extends BaseMapper<Usuario, UsuarioEditDTO> {

    @Override
    Usuario toEntity(UsuarioEditDTO usuarioEditDTO);

    @Override
    void updatedEntityFromDTO(UsuarioEditDTO usuarioEditDTO, @MappingTarget Usuario usuario);

}
