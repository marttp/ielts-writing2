export async function reviewAnswer(message: string) {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: message,
  });
  const data = await response.text();
  return data;
}
