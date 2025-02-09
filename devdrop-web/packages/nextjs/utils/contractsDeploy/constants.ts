// Temporary contansts, fetch from env or backend

export const CONTRACT = {
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  PROVIDED_URL: process.env.URL,
};

export const contributorsData = [
  { address: process.env.USER_ONE || "", amount: 100 },
  { address: process.env.USER_TWO || "", amount: 200 },
];

export const userAddress = process.env.USER_ONE;
export const userAmount = 100;
