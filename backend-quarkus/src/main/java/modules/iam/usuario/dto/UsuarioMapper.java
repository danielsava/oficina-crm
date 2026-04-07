package modules.iam.usuario.dto;

import modules.iam.usuario.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "cdi")
public interface UsuarioMapper {

    Usuario toEntity(UsuarioEditDTO usuarioEditDTO);

    void updatedEntityFromDTO(UsuarioEditDTO usuarioEditDTO, @MappingTarget Usuario usuario);

}
