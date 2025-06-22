// signupController.ts
// Handles API calls for signup/register

export async function registerUser(payload: Record<string, any>) {
  try {
    const response = await fetch("http://localhost:9000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || "Registration failed");
  }
}
