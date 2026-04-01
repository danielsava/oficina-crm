package modules.iam.usuario;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UsuarioRepository implements PanacheRepository<Usuario> {




    public Usuario findByLogin(String login) {

        return find("login", login).firstResult();
    }


    public Optional<Usuario> findByEmail(String email) {

        return find("email", email).firstResultOptional();
    }


    public List<Usuario> listByNome(String nome) {

        return list("nome", nome);
    }


    public boolean existsByLogin(String login) {

        return count("login", login) > 0;
    }


    public boolean existsByEmail(String email) {

        return count("email", email) > 0;
    }

}
