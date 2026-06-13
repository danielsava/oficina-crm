package modules.iam.usuario;

import common.BaseService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import modules.iam.auth.util.PasswordHashUtil;
import modules.iam.usuario.dto.UsuarioEditDTO;
import modules.iam.usuario.dto.UsuarioListDTO;
import modules.iam.usuario.dto.UsuarioMapper;

@ApplicationScoped
public class UsuarioService extends BaseService<Usuario, UsuarioEditDTO, UsuarioListDTO> {


    /**
     * Senha temporária aplicada a todo novo usuário criado pelo fluxo padrão de
     * cadastro enquanto o endpoint dedicado de definição/alteração de senha não
     * é implementado. Ver ADR-0003 (dívida técnica registrada).
     */
    private static final String SENHA_TEMPORARIA_PADRAO = "123456";


    @Inject
    private UsuarioRepository repository;

    @Inject
    private UsuarioMapper mapper;


    @Override
    @Transactional
    public void inserir(@Valid UsuarioEditDTO editDTO) {

        /*
        // 1. Valida força da senha
        var isSenhaValida = PasswordValidatorUtil.validate(editDTO.senha());

        if(!isSenhaValida.accepted())
            throw new ValidationException("Senha fraca: " + isSenhaValida.reason());

        var isEmailDuplicado = existePorEmail(editDTO.email());

        if(isEmailDuplicado)
            throw new ValidationException("Senha fraca: " + isSenhaValida.reason());
        */

        Usuario usuario = mapper.toEntity(editDTO);

        // Dívida técnica: senha temporária fixa. Ver ADR-0003.
        usuario.setSenhaHash(PasswordHashUtil.hash(SENHA_TEMPORARIA_PADRAO));

        repository.persist(usuario);
    }


    @Override
    public UsuarioRepository repository() { return this.repository; }

    @Override
    public UsuarioMapper mapper() { return this.mapper; }

    @Override
    public Class<UsuarioListDTO> listDTO() { return UsuarioListDTO.class; }

    @Override
    public Class<UsuarioEditDTO> editDTO() { return UsuarioEditDTO.class; }

}
