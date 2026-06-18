import axios from "axios";

export const getGoogleUser = async (access_token) => {
  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );

  return data;
};
