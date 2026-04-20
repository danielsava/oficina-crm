package modules.iam.usuario.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioEditDTO (

    @NotBlank(message = "Informe o nome")
    String nome,

    @NotBlank(message = "Informe o login")
    String login,

    @NotBlank(message = "Informe a senha")
    String senha,

    @Email(message = "Informe um email válido")
    @NotBlank(message = "Informe o email")
    String email,

    String avatar

) {  }
