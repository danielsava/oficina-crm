package modules.iam.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginDTO(

    @NotBlank(message = "Informe o email") @Email(message = "Email inválido")
    String email,

    @NotBlank(message = "Informe a senha")
    String senha

) { }
