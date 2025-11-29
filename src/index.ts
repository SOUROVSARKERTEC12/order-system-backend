if (process.env.NODE_ENV !== "production") {
  import('dotenv').then(d => d.config());
}
import { server } from "./app"; // updated from httpServer to server

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
