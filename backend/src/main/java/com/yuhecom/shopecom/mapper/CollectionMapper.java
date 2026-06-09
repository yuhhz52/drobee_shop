package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.CollectionDto;
import com.yuhecom.shopecom.entity.Collection;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CollectionMapper {
    CollectionMapper INSTANCE = Mappers.getMapper(CollectionMapper.class);

    CollectionDto toDto(Collection entity);
    List<CollectionDto> toDtoList(List<Collection> entities);
}
