import axios from "axios";

export const searchCities = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    const response = await axios.get(
      "https://secure.geonames.org/searchJSON",
      {
        params: {
          q,
          maxRows: 10,
          country: "IN",
          featureClass: "P", // 🔥 only populated places (cities)
          username: process.env.GEONAMES_USERNAME
        }
      }
    );

    const cities =
      response.data.geonames?.map((c) => c.name) || [];

    // 🔥 remove duplicates
    const uniqueCities = [...new Set(cities)];

    res.json(uniqueCities);

  } catch (error) {
    console.error("City API Error:", error.message);
    res.status(500).json([]);
  }
};