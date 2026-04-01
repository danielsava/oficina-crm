package modules.iam.usuario;

import common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;


@Entity
@Table(name = "usuario")
public class Usuario extends BaseEntity {

    public String nome;

    public String login;

    public String email;

    public String avatar;

}
