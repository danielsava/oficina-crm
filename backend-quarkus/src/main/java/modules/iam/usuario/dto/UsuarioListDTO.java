package modules.iam.usuario.dto;


import java.util.UUID;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "DTO de listagem de Usuário (retornado em GET /usuario).")
public record UsuarioListDTO (

    @Schema(description = "Identificador público do usuário", example = "9b1b1d3c-3e2c-4d57-9a3f-2c5b5d1e7a10")
    UUID uuid,

    @Schema(description = "Nome completo", example = "Maria Silva")
    String nome,

    @Schema(description = "Login de acesso", example = "maria.silva")
    String login,

    @Schema(description = "Email", example = "maria.silva@exemplo.com")
    String email

) { }
