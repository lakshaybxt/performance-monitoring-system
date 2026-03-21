export const graphqlBaseQuery = ({ baseUrl }: { baseUrl: string }) =>
  async ({ body }: { body: { query: string; variables?: Record<string, unknown> } }, api: any) => {
    const state = api.getState() as { auth: { token: string | null } };
    const token = state.auth.token;

    const result = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await result.json();

    if (json.errors) {
      return { error: { status: "GRAPHQL_ERROR", error: json.errors[0].message } };
    }

    return { data: json.data };
  };