package common.base;

import org.mapstruct.MappingTarget;

public interface BaseMapper<E extends BaseEntity, EditDTO> {

    E toEntity(EditDTO dto);

    void updatedEntityFromDTO(EditDTO dto, @MappingTarget E entity);

}
