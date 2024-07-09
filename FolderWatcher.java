import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.*;

import static java.nio.file.StandardWatchEventKinds.*;

public class FolderWatcher {

    private static final String DIRECTORY_TO_WATCH = "Songs/";

    public static void main(String[] args) {
        try {
            WatchService watchService = FileSystems.getDefault().newWatchService();
            Path path = Paths.get(DIRECTORY_TO_WATCH);

            path.register(watchService, ENTRY_CREATE, ENTRY_DELETE, ENTRY_MODIFY);

            System.out.println("Watching directory: " + DIRECTORY_TO_WATCH);

            WatchKey key;
            while ((key = watchService.take()) != null) {
                for (WatchEvent<?> event : key.pollEvents()) {
                    WatchEvent.Kind<?> kind = event.kind();

                    if (kind == OVERFLOW) {
                        continue;
                    }

                    WatchEvent<Path> ev = (WatchEvent<Path>) event;
                    Path fileName = ev.context();
                    Path child = path.resolve(fileName);

                    if (kind == ENTRY_CREATE && Files.isDirectory(child, LinkOption.NOFOLLOW_LINKS)) {
                        createInfoJsonFile(child);
                    }
                }
                key.reset();
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static void createInfoJsonFile(Path folder) {
        String jsonContent = String.format("{\n    \"title\": \"%s\",\n    \"description\": \"\"\n}", folder.getFileName());
        Path jsonFilePath = folder.resolve("info.json");

        try (FileWriter writer = new FileWriter(jsonFilePath.toFile())) {
            writer.write(jsonContent);
            System.out.println("Created info.json in " + folder);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    
}
