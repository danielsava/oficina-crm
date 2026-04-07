package common;

public interface BaseMapper<E extends BaseEntity, EditDTO> {

    E toEntity(EditDTO dto);

    void updatedEntity(EditDTO dto, E entity);

}
