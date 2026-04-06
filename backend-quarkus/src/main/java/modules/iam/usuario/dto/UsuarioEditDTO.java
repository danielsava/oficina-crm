package modules.iam.usuario.dto;

import common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;


@Entity
@Table(name = "usuario")
public class UsuarioEditDTO extends BaseEntity {

    public String nome;

    public String login;

    public String email;

    public String avatar;

}
