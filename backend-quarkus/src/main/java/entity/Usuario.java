package entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;


@Entity
public class Usuario {

    @Id
    @GeneratedValue
    public Long id;

    public String field;
}
