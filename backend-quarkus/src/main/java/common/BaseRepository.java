package common;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface BaseRepository<E extends BaseEntity> extends PanacheRepository<E> {


    default List<E> findByDynamicFilters(String name, Integer minRanking) {

        String query = "1=1"; // Base da consulta

        Map<String, Object> params = new HashMap<>();

        if (name != null) {
            query += " and name like :name";
            params.put("name", "%" + name + "%");
        }

        if (minRanking != null) {
            query += " and ranking >= :minRanking";
            params.put("minRanking", minRanking);
        }

        return find(query, params).list();
    }


    default List<E> listPaged(int pageIndex, int pageSize, String sortBy, String sortDirection) {

        return findAll(Sort.by(sortBy)
                .direction(Sort.Direction.valueOf(sortDirection)))
                .page(pageIndex, pageSize)
                .list();
    }

    default List<E> findBy(String atributo, Object valor) {

        return find(atributo, valor).list();
    }

    default Long countBy(String atributo, Object valor) {

        return find(atributo, valor).count();
    }

    default Long deleteBy(String atributo, Object valor) {

        return delete(atributo, valor);
    }

    default int inactivateById(Long id) {

        return this.update("status = ?1 where uuid = ?2", EnumStatusEntity.INATIVO, id);
    }

    default int inactivateByUuid(String uuid) {

        return this.update("status = ?1 where uuid = ?2", EnumStatusEntity.INATIVO, uuid);
    }

}
