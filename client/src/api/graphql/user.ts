// import { useGraphQLRequest } from '../helpers'
// import { type DeleteUserResponse, type UpdateUserResponse, type User } from 'types'

// TODO: Uncomment when needed
// export const fetchAllUsers = async (): Promise<User[]> => {
//   const response = await useGraphQLRequest(`
//     query GetAllUsers {
//       users {
//         id
//         name
//         email
//       }
//     }
//   `)

//   return response.data.users
// }

// TODO: Uncomment when needed
// export const createUser = async (userData: User): Promise<User> => {
//   const response = await useGraphQLRequest(
//     `
//       mutation CreateUser($input: UserCreateInput!) {
//         createUser(input: $input) {
//           id
//           name
//           email
//         }
//       }
//     `,
//     { input: userData }
//   )

//   return response.data.createUser
// }

// export const updateUser = async (
//   token: string | undefined,
//   userData: Partial<User>
// ): Promise<User> => {
//   const response = await useGraphQLRequest<UpdateUserResponse, { input: Partial<User> }>(
//     `
//       mutation UpdateUser($input: UserUpdateInput!) {
//         updateUser(input: $input) {
//           id
//         }
//       }
//     `,
//     { input: userData },
//     token
//   )

//   return response.updateUser
// }

// export const deleteUser = async (token: string | undefined): Promise<void> => {
//   const response = await useGraphQLRequest<DeleteUserResponse>(
//     `
//       mutation {
//         deleteUser
//       }
//     `,
//     undefined,
//     token
//   )

//   if (!response.deleteUser) {
//     throw new Error('Failed to delete user.')
//   }
// }
