import { makeGraphQLRequest } from '../helpers'
import { type DeleteUserResponse, type UpdateUserResponse, type User } from 'types/global'

// TODO: Uncomment when needed
// export const fetchAllUsers = async (): Promise<User[]> => {
//   const response = await makeGraphQLRequest(`
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
//   const response = await makeGraphQLRequest(
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

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const response = await makeGraphQLRequest<UpdateUserResponse, { input: Partial<User> }>(
    `
      mutation UpdateUser($input: UserUpdateInput!) {
        updateUser(input: $input) {
          id
        }
      }
    `,
    {
      input: {
        ...userData,
      },
    }
  )

  return response.updateUser
}

export const deleteUser = async (): Promise<void> => {
  const response = await makeGraphQLRequest<DeleteUserResponse>(
    `
      mutation {
        deleteUser
      }
    `
  )

  if (!response.deleteUser) {
    throw new Error('Failed to delete user.')
  }
}
