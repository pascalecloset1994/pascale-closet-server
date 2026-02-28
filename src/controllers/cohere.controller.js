import { cohereContent } from "../config/cohereContent.js";
import { cohere } from "../services/iaHelper.service.js";

export class CohereController {
  initChat = async (req, res) => {
    const { message } = req.query;

    if (!message) {
      return res
        .status(400)
        .json({ message: "Los campos son necesarios.", message });
    }

    try {
      const response = await cohere.chat({
        model: "command-a-03-2025",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: cohereContent(message),
          },
          {
            role: "user",
            content: "Responde lo que se te provee en el content.",
          },
        ],
      });

      const content = response.message.content[0].text;

      res.status(200).json({ content });
    } catch (error) {
      res.status(500).json({ message: "Error en el servidor: " + error });
    }
  };
}
