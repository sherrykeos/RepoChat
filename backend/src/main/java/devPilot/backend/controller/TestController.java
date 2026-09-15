package devPilot.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
public class TestController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "DevPilot Backend is up and running!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello from DevPilot API!";
    }
}
