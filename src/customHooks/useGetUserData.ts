"use client"
import { useSession } from "next-auth/react"

 

export default function useGetUserData() {

    const {data:session} = useSession()
    const user = session?.user

    if(!user) {
        throw new Error("there is no user found")
    }

    return user

}