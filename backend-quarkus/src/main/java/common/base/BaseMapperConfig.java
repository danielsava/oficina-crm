package common.base;

import org.mapstruct.MapperConfig;
import org.mapstruct.ReportingPolicy;

@MapperConfig(
        componentModel = "cdi",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface BaseMapperConfig {
}
