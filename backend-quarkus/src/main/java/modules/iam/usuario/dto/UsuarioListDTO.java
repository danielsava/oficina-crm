package modules.iam.usuario.dto;

import java.util.UUID;

public record UsuarioListDTO(

        UUID uuid,

        String nome,

        String login,

        String email

) { }
