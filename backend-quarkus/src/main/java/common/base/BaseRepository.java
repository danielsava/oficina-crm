package common.base;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

public interface BaseRepository<Entity extends BaseEntity> extends PanacheRepository<Entity> {


}
