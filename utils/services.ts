export const SERVICE_URLS = {
  AuthService: 'http://localhost:5050',
  AppointmentService: 'http://localhost:5051',
  RequestTicketService: 'http://localhost:5052/api',
  ChatbotService: 'http://localhost:5053',
};

export async function createAppointment(scheduleId: string, content: string): Promise<string | null> {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!accessToken) return null;
  const res = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment/create`, {
    method: 'POST',
    headers: {
      'accept': 'application/octet-stream',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scheduleId, content }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.success && data.response && data.response.checkoutUrl) {
    return data.response.checkoutUrl;
  }
  return null;
}
