package modules.iam.usuario;

import common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_usuario")
public class Usuario extends BaseEntity {


    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "login", nullable = false, updatable = false, unique=true)
    private String login;

    @Column(name = "senha", nullable = false)
    private String senha;

    @Column(name = "email")
    private String email;

    @Column(name = "avatar")
    private String avatar;


    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

}
