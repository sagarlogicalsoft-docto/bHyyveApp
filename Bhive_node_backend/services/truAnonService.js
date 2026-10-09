const axios = require("axios");

function buildUrl(path) {
  const base = (process.env.TRUANON_API_URL || "").replace(/\/+$/, "");
  return `${base}/${path}`;
}

class TruAnonService {

  async getProfile(username) {
    try {
      const response = await axios.get(
        buildUrl("get_profile"),
        {
          params: {
            id: username,
            service: process.env.TRUANON_SERVICE_NAME
          },
          headers: {
            Authorization: process.env.TRUANON_PRIVATE_KEY
          },
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      console.error("TruAnon Error:", error.response?.data || error.message);
      throw error;
    }
  }

  async getToken(username) {
    try {
      const response = await axios.get(
        buildUrl("get_token"),
        {
          params: {
            id: username,
            service: process.env.TRUANON_SERVICE_NAME
          },
          headers: {
            Authorization: process.env.TRUANON_PRIVATE_KEY
          },
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      console.error("TruAnon getToken Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new TruAnonService();