package modules.iam.usuario.dto;

import common.base.BaseMapper;
import modules.iam.usuario.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface UsuarioMapper extends BaseMapper<Usuario, UsuarioEditDTO> {

}
