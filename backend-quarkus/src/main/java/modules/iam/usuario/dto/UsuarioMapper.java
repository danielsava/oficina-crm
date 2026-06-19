package modules.iam.usuario.dto;

import common.base.BaseMapper;
import common.base.BaseMapperConfig;
import modules.iam.usuario.Usuario;
import org.mapstruct.Mapper;

@Mapper(config = BaseMapperConfig.class)
public interface UsuarioMapper extends BaseMapper<Usuario, UsuarioEditDTO> {

}
