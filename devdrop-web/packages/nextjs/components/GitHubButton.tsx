"use client";

import { signIn } from "next-auth/react";

export default function GitHubButton() {
  return (
    <button className="btn btn-primary btn-sm mx-4" onClick={() => signIn("github")}>
      Sign In
    </button>
  );
}
