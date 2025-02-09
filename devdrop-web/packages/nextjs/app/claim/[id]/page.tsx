"use client";

import { useParams } from "next/navigation";
import ClaimButton from "~~/components/ClaimButton";

const Disperse = () => {
  const id = useParams() as unknown as { id: string };
  return <ClaimButton id={id} />;
};

export default Disperse;
