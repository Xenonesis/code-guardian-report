export default async function handler(request: Request) {
  // Parse the request method and body
 const { method } = request;
  
  if (method === 'POST') {
    try {
      // Get the request body
      const body = await request.json();
      
      // Log push notification data (in a real implementation, you would send the notification)
      console.log('Push notification send request received:', body);
      
      // For now, just return success
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Push send error:', error);
      return new Response(JSON.stringify({ error: 'Failed to process push send request' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } else if (method === 'GET') {
    // Return send status
    return new Response(JSON.stringify({ 
      status: 'push send endpoint is working',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
 } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
