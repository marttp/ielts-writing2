import axios from "axios";

export async function reviewAnswer(message: string) {
  const response = await axios.post("/api", message, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
  const reviewResult = response.data;
  return reviewResult;
}
