export const APIEndPoints = {
  questions: "https://quizapi.io/api/v1/questions",
  categories: "https://quizapi.io//api/v1/categories",
  tags: "https://quizapi.io//api/v1/tags",
  apiKey: "k5tj3FRfAipGkIHiAAf7xFQojwOOJsdmajmxu0g6",
};
export async function startQuiz(usn, category, questionsLimit, diff) {
  try {
    let url = new URL(APIEndPoints.questions);
    url.searchParams.append("apiKey", APIEndPoints.apiKey);
    url.searchParams.append("limit", questionsLimit);
    url.searchParams.append("category", category);
    url.searchParams.append("difficulty", diff);
    console.log(url.href);
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    let data = await response.json();
    console.log(data);
  } catch (error) {
    console.log("Error:", error);
  }
}
