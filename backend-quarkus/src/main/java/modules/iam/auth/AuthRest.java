package modules.iam.auth;

import io.quarkus.security.UnauthorizedException;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import modules.iam.auth.dto.LoginDTO;

@Path("/auth")
public class AuthRest {


    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public void login(@Valid LoginDTO login) {

        boolean autenticado = authService.autenticar(login.email(), login.senha());

        if (!autenticado)
            throw new UnauthorizedException("Credenciais inválidas");

        // Aqui você geraria JWT ou sessão
    }

}
