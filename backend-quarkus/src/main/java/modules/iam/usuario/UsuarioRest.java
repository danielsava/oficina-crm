package modules.iam.usuario;

import common.base.BaseRest;
import jakarta.inject.Inject;
import jakarta.ws.rs.Path;
import modules.iam.usuario.dto.UsuarioEditDTO;
import modules.iam.usuario.dto.UsuarioListDTO;

@Path("/usuario")
public class UsuarioRest extends BaseRest<Usuario, UsuarioEditDTO, UsuarioListDTO> {


    @Inject
    UsuarioService service;


    public UsuarioService service() { return this.service; }

}
