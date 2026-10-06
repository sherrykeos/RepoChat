package repochat.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(BackendApplication.class, args);
	}

	private static void loadDotEnv() {
		Path[] possiblePaths = new Path[] {
				Paths.get(".env"),
				Paths.get("backend", ".env"),
				Paths.get("..", ".env")
		};
		for (Path path : possiblePaths) {
			if (Files.exists(path)) {
				try {
					List<String> lines = Files.readAllLines(path);
					for (String line : lines) {
						String trimmed = line.trim();
						if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
							continue;
						}
						int idx = trimmed.indexOf('=');
						String key = trimmed.substring(0, idx).trim();
						String value = trimmed.substring(idx + 1).trim();
						if ((value.startsWith("\"") && value.endsWith("\"")) ||
								(value.startsWith("'") && value.endsWith("'"))) {
							value = value.substring(1, value.length() - 1);
						}
						if (System.getProperty(key) == null && System.getenv(key) == null) {
							System.setProperty(key, value);
						}
					}
					System.out.println("Loaded environment variables from " + path.toAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("Failed to read .env file at " + path + ": " + e.getMessage());
				}
			}
		}
	}

}