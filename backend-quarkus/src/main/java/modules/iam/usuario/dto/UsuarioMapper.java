package modules.iam.usuario.dto;

import common.BaseMapper;
import modules.iam.usuario.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "cdi")
public interface UsuarioMapper extends BaseMapper<Usuario, UsuarioEditDTO> {

    @Override
    @Mapping(target = "senhaHash", ignore = true)
    Usuario toEntity(UsuarioEditDTO usuarioEditDTO);

    @Override
    @Mapping(target = "senhaHash", ignore = true)
    @Mapping(target = "login", ignore = true)
    void updatedEntityFromDTO(UsuarioEditDTO usuarioEditDTO, @MappingTarget Usuario usuario);

}
