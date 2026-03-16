import { graphqlRequest } from "./graphql";

export async function loginUser(email, password) {
    const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        msg
        token
      }
    }
  `;

    const data = await graphqlRequest(query, { email, password });
    return data.login;
}

export async function registerUser(name, email, password) {
    const query = `
    mutation Register($name: String!, $email: String!, $password: String!) {
      register(name: $name, email: $email, password: $password)
    }
  `;

    const data = await graphqlRequest(query, { name, email, password });
    return data.register;
}
