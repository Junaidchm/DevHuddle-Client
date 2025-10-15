// "use client"
// import { useSession } from "next-auth/react"

 
// export default function useGetUserData() {

//     console.log('this is working wihtout any problem ...................')

//     const {data:session} = useSession()
//     const user = session?.user

//     console.log('this is the user data', session)

//     if(!user) {
//         throw new Error("there is no user found")
//     }

//     return user

// }

"use client";
import { useSession } from "next-auth/react";

export default function useGetUserData() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // or return { loading: true }
  }

  if (status === "unauthenticated") {
    return null;
  }

  return session?.user ?? null;
}


