import { useParams } from "next/navigation";
import ClaimButton from "~~/components/ClaimButton";

const Disperse = () => {
  const id = useParams();
  return <ClaimButton id={id} />;
};

export default Disperse;
