import axios from "axios";

export async function reviewAnswer(message: string) {
  const response = await axios.post<string>("/api", message, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return response;
}
