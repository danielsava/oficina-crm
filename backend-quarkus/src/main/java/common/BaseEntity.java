package common;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @SequenceGenerator(
            name = "base_entity_seq",
            sequenceName = "global_id_seq",
            allocationSize = 20
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "base_entity_seq"
    )
    @Column(name = "id")
    public Long id;

    @Column(name = "uuid", nullable = false, updatable = false, length = 60)
    public String uuid;

    @Version
    @Column(name = "version")
    public Long version;

    @Column(name = "created_at", updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;


    @PrePersist
    void prePersist() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;

        this.updatedAt = now;

        if (this.uuid == null || this.uuid.isBlank())
            this.uuid = UUID.randomUUID().toString();

    }

    @PreUpdate
    void preUpdate() {

        this.updatedAt = LocalDateTime.now();
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        BaseEntity that = (BaseEntity) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

}
