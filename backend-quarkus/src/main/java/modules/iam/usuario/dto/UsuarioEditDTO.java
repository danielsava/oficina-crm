package modules.iam.usuario.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "DTO de formulário de Usuário (entrada para POST/PUT e leitura para GET /{uuid}).")
public record UsuarioEditDTO (

    @NotBlank(message = "Informe o nome")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    @Schema(description = "Nome completo do usuário", example = "Maria Silva", maxLength = 150, required = true)
    String nome,

    @NotBlank(message = "Informe o login")
    @Size(min = 3, max = 50, message = "Login deve ter entre 3 e 50 caracteres")
    @Schema(description = "Login de acesso (único)", example = "maria.silva", minLength = 3, maxLength = 50, required = true)
    String login,

    @Email(message = "Informe um email válido")
    @NotBlank(message = "Informe o email")
    @Size(max = 150, message = "Email deve ter no máximo 150 caracteres")
    @Schema(description = "Email do usuário (único)", example = "maria.silva@exemplo.com", maxLength = 150, required = true)
    String email,

    @Size(max = 255, message = "Avatar deve ter no máximo 255 caracteres")
    @Schema(description = "URL ou caminho do avatar do usuário", maxLength = 255)
    String avatar

) {  }
