import { getImageTagsFromOntology } from "./eventImageToTags";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const imagePath = path.resolve(__dirname, "../../data/raw/nonsense_ 5.2 to 5.9_images/ModelMajority_May16.png");
const llamaApiKey = process.env.LLAMA_API_KEY;

if (!llamaApiKey) {
  console.error("LLAMA_API_KEY not found in .env file");
  process.exit(1);
}

(async () => {
  try {
    const tags = await getImageTagsFromOntology(imagePath, llamaApiKey);
    console.log(tags);
  } catch (err) {
    console.error(err);
  }
})();