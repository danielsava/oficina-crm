package common;

public interface BaseMapper<E extends BaseEntity, EditDTO> {

    E toEntity(EditDTO dto);

    void updatedEntityFromDTO(EditDTO dto, E entity);

}
