package com.lingocard.backend.service;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

// This function shows progress bar on fetching card sets
@Service
public class SseService {
    // Thread-safe list of everyone currently listening to the broadcast
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // React will call this to "tune in"
    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(600000L); // 10min timeout
        emitters.add(emitter);

        // remove listener when finished
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        return emitter;
    }

    // call to broadcast live percentage
    public void sendProgress(String jsonMessage) {
        for (SseEmitter emitter : emitters) {
            try {
                // broadcast event
                emitter.send(SseEmitter.event().name("progress").data(jsonMessage));
            } catch (IOException e) {
                emitters.remove(emitter);   // drop dead connection
            }
        }
    }

}
