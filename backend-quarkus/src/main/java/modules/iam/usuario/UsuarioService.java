package modules.iam.usuario;

import common.BaseService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import modules.iam.usuario.dto.UsuarioEditDTO;
import modules.iam.usuario.dto.UsuarioListDTO;
import modules.iam.usuario.dto.UsuarioMapper;

@ApplicationScoped
public class UsuarioService extends BaseService<Usuario, UsuarioEditDTO, UsuarioListDTO> {


    @Inject
    UsuarioRepository repository;

    @Inject
    UsuarioMapper mapper;



    public UsuarioRepository repository() { return this.repository; }

    public UsuarioMapper mapper() { return this.mapper; }

    public Class<UsuarioListDTO> listDTO() { return UsuarioListDTO.class; }

}