package infra.event;

import io.quarkus.logging.Log;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;

import java.time.LocalDateTime;

@ApplicationScoped
public class StartupListener {

    void startup(@Observes StartupEvent event) {

        Log.info("Aplicação iniciada em " + LocalDateTime.now());
    }
    
}
