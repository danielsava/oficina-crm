package common;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

public interface BaseRepository<E extends BaseEntity> extends PanacheRepository<E> {



    default int inativarPorId(Long id) {

        return this.update("status = ?1 where id = ?2", EnumStatusEntity.INATIVO, id);
    }

    default int inativarPorUUID(String uuid) {

        return this.update("status = ?1 where uuid = ?2", EnumStatusEntity.INATIVO, uuid);
    }


    /*
    default List<E> listarPaginado(int pageIndex, int pageSize, String sortBy, String sortDirection) {

        return findAll(Sort.by(sortBy)
                .direction(Sort.Direction.valueOf(sortDirection)))
                .page(pageIndex, pageSize)
                .list();
    }

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
    }*/

}
