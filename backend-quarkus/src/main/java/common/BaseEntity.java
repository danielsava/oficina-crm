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

    @Column(name = "id", nullable = false, updatable = false, unique=true)
    private Long id;

    @Column(name = "uuid", nullable = false, updatable = false, unique=true)
    private UUID uuid;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @PrePersist
    void prePersist() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;

        this.updatedAt = now;

        if (this.uuid == null || this.uuid.toString().isEmpty())
            this.uuid = UUID.randomUUID();

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


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
