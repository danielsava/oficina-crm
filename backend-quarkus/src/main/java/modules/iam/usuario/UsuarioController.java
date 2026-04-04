package modules.iam.usuario;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;

import java.util.List;

/**
 *
 *  Media Type:
 *
 *      - When a JSON extension is installed such as quarkus-rest-jackson or quarkus-rest-jsonb,
 *      Quarkus will use the application/json media type by default for most return values,
 *      unless the media type is explicitly set via @Produces or @Consumes annotations
 *      (there are some exceptions for well known types, such as String and File,
 *      which default to text/plain and application/octet-stream respectively).
 *
 *  JSON (ObjectMapper):
 *
 *      - In Quarkus, the default Jackson ObjectMapper obtained via CDI (and consumed by the Quarkus extensions)
 *      is configured to ignore unknown properties
 *      (by disabling the DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES feature).
 *
 *      - Furthermore, the ObjectMapper is configured to format dates and time in ISO-8601
 *      (by disabling the SerializationFeature.WRITE_DATES_AS_TIMESTAMPS feature)
 *
 *
 */

@Path("/usuario")
public class UsuarioController {


    @Inject
    UsuarioService usuarioService;


    @GET
    public List<Usuario> listar() {

        return usuarioService.listar();
    }

    @GET
    @Path("/{id}")
    public Usuario buscarPorId(@PathParam("id") Long id) {

        Usuario usuario = usuarioService.consultarPorId(id);

        if (usuario == null)
            throw new NotFoundException("Usuário não encontrado"); //Response.status(Response.Status.NOT_FOUND).build();

        return usuario; // Response.ok(usuario).build();
    }

    @POST
    public Usuario inserir(Usuario usuario) {

        return usuarioService.inserir(usuario);

        //return Response.status(Response.Status.CREATED).entity(novoUsuario).build();
    }

    @PUT
    @Path("/{id}")
    public Usuario atualizar(@PathParam("id") Long id, Usuario usuarioAtualizado) {

        Usuario usuario = usuarioService.atualizar(id, usuarioAtualizado);

        if (usuario == null)
            throw new NotFoundException("Usuário não encontrado"); // return Response.status(Response.Status.NOT_FOUND).build();

        return usuario; //Response.ok(usuario).build();
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {

        boolean deleted = usuarioService.excluir(id);

        if (!deleted)
            throw new NotFoundException("Usuário não encontrado"); // return Response.status(Response.Status.NOT_FOUND).build();

    }

}
