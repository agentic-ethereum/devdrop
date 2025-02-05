"use client";

import { signIn } from "next-auth/react";

export default function GitHubButton() {
  return (
    <button className="btn mx-4" onClick={() => signIn()}>
      Sign In
    </button>
  );
}
