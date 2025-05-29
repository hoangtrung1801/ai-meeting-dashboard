import { apiRequest } from "../queryClient";

const BASE_URL = "http://localhost:3000/api/v1";

const botApi = {
  startRecording: async (meetingId: string) => {
    const response = await apiRequest(
      "POST",
      `${BASE_URL}/bots/recording/start`,
      {
        meetingId,
      }
    );
    const data = await response.json();
    return data;
  },
  stopRecording: async (meetingId: string) => {
    const response = await apiRequest(
      "POST",
      `${BASE_URL}/bots/recording/stop`,
      {
        meetingId,
      }
    );
    const data = await response.json();
    return data;
  },
  stopRecordingById: async (id: string) => {
    const response = await apiRequest("POST", `${BASE_URL}/bots/${id}/stop`);
    const data = await response.json();
    return data;
  },
};

export default botApi;
