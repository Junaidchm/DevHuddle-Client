import { auth } from "@/auth";
import { redirect } from "next/navigation";


export async function authCheckRedirectToSignin() {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
        redirect("/signIn");
       
      }
      return session
}