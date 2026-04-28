package modules.iam.usuario;

import common.BaseService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import jakarta.ws.rs.NotFoundException;
import modules.iam.auth.util.PasswordHashUtil;
import modules.iam.auth.util.PasswordValidatorUtil;
import modules.iam.usuario.dto.UsuarioEditDTO;
import modules.iam.usuario.dto.UsuarioListDTO;
import modules.iam.usuario.dto.UsuarioMapper;

@ApplicationScoped
public class UsuarioService extends BaseService<Usuario, UsuarioEditDTO, UsuarioListDTO> {


    @Inject
    UsuarioRepository repository;

    @Inject
    UsuarioMapper mapper;

    @Inject
    PasswordHashUtil passwordHasher;


    public UsuarioRepository repository() { return this.repository; }

    public UsuarioMapper mapper() { return this.mapper; }

    public Class<UsuarioListDTO> listDTO() { return UsuarioListDTO.class; }


    @Override
    @Transactional
    public void inserir(@Valid UsuarioEditDTO editDTO) {

        // 1. Valida força da senha
        var isSenhaValida = PasswordValidatorUtil.validate(editDTO.senha());

        if(!isSenhaValida.accepted())
            throw new ValidationException("Senha fraca: " + isSenhaValida.reason());

        var isEmailDuplicado = existePorEmail(editDTO.email());

        if(isEmailDuplicado)
            throw new ValidationException("Senha fraca: " + isSenhaValida.reason());

        Usuario usuario = mapper.toEntity(editDTO);

        usuario.setSenhaHash(passwordHasher.hash(editDTO.senha()));

        repository.persist(usuario);
    }


    @Override
    @Transactional
    public void atualizar(Long id, UsuarioEditDTO editDTO) {

        Usuario usuario = buscarPorId(id);

        if (usuario == null)
            throw new NotFoundException("Registro não encontrado");

        mapper.updatedEntityFromDTO(editDTO, usuario);

        if (editDTO.senha() != null && !editDTO.senha().isBlank())
            usuario.setSenhaHash(passwordHasher.hash(editDTO.senha()));
    }


    public boolean existePorEmail(String email) {

        return existePor("email", email);
    }

    public Usuario buscarPorEmail(String email) {

        return buscarPor("email", email);
    }

}
