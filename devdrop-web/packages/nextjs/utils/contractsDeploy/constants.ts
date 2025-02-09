// Temporary contansts, fetch from env or backend

export const CONTRACT = {
  PRIVATE_KEY: process.env.NEXT_PUBLIC_PRIVATE_KEY || "",
  PROVIDED_URL: process.env.NEXT_PUBLIC_USER_URL,
};

export const contributorsData = [
  { address: process.env.NEXT_PUBLIC_USER_ONE || "", amount: 100 },
  { address: process.env.NEXT_PUBLIC_USER_TWO || "", amount: 200 },
];

export const userAddress = process.env.USER_ONE;
export const userAmount = 100;
