package modules.iam.usuario.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioEditDTO (

    @NotBlank(message = "Informe o nome")
    String nome,

    @Size(min = 3, max = 50, message = "O tamanho do login deve estar entre 3 e 50 caracteres")
    @NotBlank(message = "Informe o login")
    String login,

    @Email
    @NotBlank(message = "Informe o email")
    String email,

    String avatar

) {  }
