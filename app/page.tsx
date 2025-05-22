"use client"
import { useUser } from "@stackframe/stack";
import { redirect } from "next/navigation";

export default function Home() {
  // Check if user is authenticated
  const user = useUser({or:"redirect"});
  
  // If authenticated, redirect to the home page in the auth route group
  if (user) {
    return redirect("/dashboard");
  }
  
  // If not authenticated, Stack will handle the redirect to sign-in
  return null;
}