package modules.iam.usuario.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioEditDTO (

    @NotBlank(message = "Informe o nome")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    String nome,

    @NotBlank(message = "Informe o login")
    @Size(min = 3, max = 50, message = "Login deve ter entre 3 e 50 caracteres")
    String login,

    @NotBlank(message = "Informe a senha")
    @Size(min = 8, max = 150, message = "Senha deve ter entre 8 e 150 caracteres")
    String senha,

    @Email(message = "Informe um email válido")
    @NotBlank(message = "Informe o email")
    @Size(max = 150, message = "Email deve ter no máximo 150 caracteres")
    String email,

    @Size(max = 255, message = "Avatar deve ter no máximo 255 caracteres")
    String avatar

) {  }
