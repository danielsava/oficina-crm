package modules.iam.usuario;


import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

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

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello from Quarkus REST";
    }

}
